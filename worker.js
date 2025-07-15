'use strict';
/**
 * @fileoverview This file contains the worker script for processing video and audio segments.
 * It includes functionality for parsing transport streams, extracting elementary streams,
 * and creating initialization and media segments for MSE.
 */
var MAKE_FIRST_FRAME_KEY = getBrowserEngineVersion() < 50;

var STATE_CHANGE_VARIANT = 9;

function Check(pCondition) {
	if (!pCondition) {
		throw new Error('Check failed');
	}
}

function getBrowserEngineVersion() {
	if (!getBrowserEngineVersion.hasOwnProperty('_nResult')) {
		if (navigator.userAgentData) {
			for (const {brand, version} of navigator.userAgentData.brands) {
				if (brand === 'Chromium' || brand === 'Google Chrome') {
					getBrowserEngineVersion._nResult = Number.parseInt(version, 10);
					break;
				}
			}
		}
		if (!getBrowserEngineVersion._nResult) {
			getBrowserEngineVersion._nResult = navigator.userAgent ? Number.parseInt(/Chrome\/(\d+)/.exec(navigator.userAgent)[1], 10) : 89;
		}
	}
	return getBrowserEngineVersion._nResult;
}

function isMobileDevice() {
	if (!isMobileDevice.hasOwnProperty('_bResult')) {
		isMobileDevice._bResult = navigator.userAgentData ? navigator.userAgentData.mobile : navigator.userAgent.includes('Android');
	}
	return isMobileDevice._bResult;
}

if (getBrowserEngineVersion() < 58) {
	Uint8Array.prototype.copyWithin = function(target, begin, end) {
		target |= 0;
		begin |= 0;
		end |= 0;
		var c = end - begin | 0;
		if ((c | 0) > 70) {
			this.set(new Uint8Array(this.buffer, begin, c), target);
		} else {
			while ((begin | 0) < (end | 0)) {
				this[target] = this[begin];
				target = target + 1 | 0;
				begin = begin + 1 | 0;
			}
		}
	};
}

if (getBrowserEngineVersion() >= 70) {
	var CreateDataView = abBuffer => new DataView(abBuffer.buffer);
} else {
	CreateDataView = (abBuffer => abBuffer);
	Uint8Array.prototype.getUint8 = function(p) {
		p |= 0;
		return this[p];
	};
	Uint8Array.prototype.getInt16 = function(p) {
		p |= 0;
		return this[p] << 24 >> 16 | this[p + 1 | 0];
	};
	Uint8Array.prototype.getUint16 = function(p) {
		p |= 0;
		return this[p] << 8 | this[p + 1 | 0];
	};
	Uint8Array.prototype.getInt32 = function(p) {
		p |= 0;
		return this[p] << 24 | this[p + 1 | 0] << 16 | this[p + 2 | 0] << 8 | this[p + 3 | 0];
	};
	Uint8Array.prototype.getUint32 = function(p) {
		p |= 0;
		return (this[p] << 24 | this[p + 1 | 0] << 16 | this[p + 2 | 0] << 8 | this[p + 3 | 0]) >>> 0;
	};
	Uint8Array.prototype.setInt8 = Uint8Array.prototype.setUint8 = function(p, nValue) {
		p |= 0;
		nValue |= 0;
		this[p] = nValue;
	};
	Uint8Array.prototype.setInt16 = Uint8Array.prototype.setUint16 = function(p, nValue) {
		p |= 0;
		nValue |= 0;
		this[p] = nValue >> 8;
		this[p + 1 | 0] = nValue;
	};
	Uint8Array.prototype.setInt32 = Uint8Array.prototype.setUint32 = function(p, nValue) {
		p |= 0;
		nValue |= 0;
		this[p] = nValue >> 24;
		this[p + 1 | 0] = nValue >> 16;
		this[p + 2 | 0] = nValue >> 8;
		this[p + 3 | 0] = nValue;
	};
}

Uint8Array.prototype.getUint64 = function(p) {
	p |= 0;
	return ((this[p] << 24 | this[p + 1 | 0] << 16 | this[p + 2 | 0] << 8 | this[p + 3 | 0]) >>> 0) * 4294967296 + ((this[p + 4 | 0] << 24 | this[p + 5 | 0] << 16 | this[p + 6 | 0] << 8 | this[p + 7 | 0]) >>> 0);
};

Uint8Array.prototype.setInt64 = Uint8Array.prototype.setUint64 = function(p, nValue) {
	p |= 0;
	var n = Math.trunc(nValue);
	if (n < Number.MIN_SAFE_INTEGER || n > Number.MAX_SAFE_INTEGER) {
		throw new Error(nValue);
	}
	var n32 = n / 4294967296 | 0;
	this[p] = n32 >> 24;
	this[p + 1 | 0] = n32 >> 16;
	this[p + 2 | 0] = n32 >> 8;
	this[p + 3 | 0] = n32;
	n32 = n | 0;
	this[p + 4 | 0] = n32 >> 24;
	this[p + 5 | 0] = n32 >> 16;
	this[p + 6 | 0] = n32 >> 8;
	this[p + 7 | 0] = n32;
};

class Wasm {
	constructor() {
		this._oModule = null;
		this._oMemory = null;
		this._oInstance = null;
	}
	_CalculateHeapSize(nSize) {
		return Math.ceil(nSize) + (Wasm.PAGE_SIZE - 1) & ~(Wasm.PAGE_SIZE - 1);
	}
	Compile() {
		return fetch('wasm.wasm').then(oResponse => oResponse.arrayBuffer()).then(bufCode => WebAssembly.compile ? WebAssembly.compile(bufCode) : new WebAssembly.Module(bufCode)).then(oModule => {
			this._oModule = oModule;
		});
	}
	AllocateMemory(nSize) {
		nSize = this._CalculateHeapSize(nSize);
		if (this._oMemory === null) {
			this._oMemory = new WebAssembly.Memory({
				initial: nSize / Wasm.PAGE_SIZE
			});
			this._oInstance = new WebAssembly.Instance(this._oModule, {
				i: {
					m: this._oMemory
				}
			});
		} else {
			this._oMemory.grow((nSize - this._oMemory.buffer.byteLength) / Wasm.PAGE_SIZE);
		}
		return [ this._oMemory.buffer, this._oInstance.exports ];
	}
	FreeMemory() {
		this._oMemory = null;
		this._oInstance = null;
	}
	static IsAvailable() {
		return !!self.WebAssembly;
	}
}

Wasm.PAGE_SIZE = 65536;

class Asmjs {
	_CalculateHeapSize(nSize) {
		nSize = Math.ceil(nSize);
		if (nSize <= Wasm.PAGE_SIZE) {
			return Wasm.PAGE_SIZE;
		}
		if (nSize < 1 << 24) {
			return 1 << 32 - Math.clz32(nSize - 1);
		}
		return nSize + 16777215 & 4278190080;
	}
	Compile() {
		importScripts('asmjs.js');
		return Promise.resolve();
	}
	AllocateMemory(nSize) {
		nSize = this._CalculateHeapSize(nSize);
		var bufHeap = new ArrayBuffer(nSize);
		return [ bufHeap, AsmjsModule(self, null, bufHeap) ];
	}
	FreeMemory() {}
}

class BitStream {
	constructor(abBuffer, pStart, pEnd) {
		Check(Number.isInteger(pStart) && Number.isInteger(pEnd) && pStart >= 0 && pEnd <= abBuffer.length && pEnd >= pStart);
		this._abBuffer = abBuffer;
		this._pNextByte = pStart;
		this._nNextBit = 7;
		this.nBitsLeft = (pEnd - pStart) * 8;
	}
	SkipBits(nBits) {
		Check(Number.isInteger(nBits));
		Check((this.nBitsLeft -= nBits) >= 0);
		if (nBits === 1) {
			if (--this._nNextBit < 0) {
				this._nNextBit = 7;
				++this._pNextByte;
			}
		} else {
			var n = this._nNextBit - nBits;
			if (n >= 0) {
				this._nNextBit = n;
			} else {
				n = -n - 1;
				this._nNextBit = 7 - (n & 7);
				this._pNextByte += (n >>> 3) + 1;
			}
		}
	}
	ReadBits(nBits) {
		Check(Number.isInteger(nBits));
		Check((this.nBitsLeft -= nBits) >= 0);
		if (nBits === 1) {
			nResult = this._abBuffer[this._pNextByte] >>> this._nNextBit & 1;
			if (--this._nNextBit < 0) {
				this._nNextBit = 7;
				++this._pNextByte;
			}
		} else {
			Check(nBits >= 1 && nBits <= 32);
			var nResult = 0;
			var nNextBitResult = nBits - 1;
			var nMask = (1 << this._nNextBit + 1) - 1;
			do {
				var nBitsRead = this._abBuffer[this._pNextByte] & nMask;
				nResult |= this._nNextBit < nNextBitResult ? nBitsRead << nNextBitResult - this._nNextBit : nBitsRead >>> this._nNextBit - nNextBitResult;
				var nBitsAdded = Math.min(nNextBitResult, this._nNextBit) + 1;
				if ((this._nNextBit -= nBitsAdded) < 0) {
					this._nNextBit = 7;
					++this._pNextByte;
					nMask = 255;
				}
			} while ((nNextBitResult -= nBitsAdded) >= 0);
		}
		return nResult >>> 0;
	}
	ReadUnsignedExpGolomb() {
		for (var nLeadingZeros = 0; this.ReadBits(1) === 0; ++nLeadingZeros) {}
		Check(nLeadingZeros <= 31);
		return nLeadingZeros === 0 ? 0 : (1 << nLeadingZeros >>> 0) - 1 + this.ReadBits(nLeadingZeros);
	}
	ReadSignedExpGolomb() {
		var n = this.ReadUnsignedExpGolomb();
		return (n & 1) != 0 ? Math.ceil(n / 2) : -n / 2;
	}
	SkipExpGolomb() {
		for (var nLeadingZeros = 0; this.ReadBits(1) === 0; ++nLeadingZeros) {}
		if (nLeadingZeros !== 0) {
			this.SkipBits(nLeadingZeros);
		}
	}
}

class IsoBaseMedia {
	constructor(abBuffer, dvBuffer, pStart) {
		Check(Number.isInteger(pStart) && pStart >= 0 && pStart <= abBuffer.length);
		this.abBuffer = abBuffer;
		this.dvBuffer = dvBuffer;
		this.pStart = pStart;
		this.pEnd = pStart;
	}
	Finish() {
		Check(Number.isInteger(this.pEnd) && this.pEnd >= this.pStart && this.pEnd <= this.abBuffer.length);
		return this.abBuffer.subarray(this.pStart, this.pEnd);
	}
	AddFullBox(sType, nVersion, nFlags, pContent) {
		Check(sType.length === 4 && Number.isFinite(nVersion) && Number.isFinite(nFlags));
		Check(this.pEnd >= this.pStart);
		var pStart = this.pEnd;
		Check(this.abBuffer.length - this.pEnd >= 8);
		this.abBuffer[pStart + 4] = sType.charCodeAt(0);
		this.abBuffer[pStart + 5] = sType.charCodeAt(1);
		this.abBuffer[pStart + 6] = sType.charCodeAt(2);
		this.abBuffer[pStart + 7] = sType.charCodeAt(3);
		this.pEnd += 8;
		if (nVersion !== -1) {
			Check(nVersion >= 0 && nVersion <= 255 && nFlags >= 0 && nFlags <= 16777215);
			Check(this.abBuffer.length - this.pEnd >= 4);
			this.dvBuffer.setUint32(pStart + 8, nVersion << 24 | nFlags);
			this.pEnd += 4;
		}
		if (typeof pContent == 'number') {
			Check(Number.isInteger(pContent) && pContent >= 0);
			this.pEnd += pContent;
			Check(this.pEnd <= this.abBuffer.length);
		} else if (typeof pContent == 'function') {
			var p = this.pEnd;
			pContent();
			Check(Number.isInteger(this.pEnd) && this.pEnd >= p && this.pEnd <= this.abBuffer.length);
		} else {
			this.CopyFromArray(this.pEnd, pContent);
		}
		this.dvBuffer.setUint32(pStart, this.pEnd - pStart);
	}
	AddBox(sType, pContent) {
		return this.AddFullBox(sType, -1, -1, pContent);
	}
	CopyFromArray(pTo, acFrom) {
		Check(Number.isInteger(pTo) && pTo >= this.pEnd);
		this.abBuffer.set(acFrom, pTo);
		this.pEnd = pTo + acFrom.length;
	}
	CopyFromBuffer(pTo, abFrom, pStart, pEnd) {
		Check(Number.isInteger(pTo) && pTo >= this.pEnd);
		Check(abFrom.buffer !== this.abBuffer.buffer);
		if (arguments.length === 2) {
			this.abBuffer.set(abFrom, pTo);
			this.pEnd = pTo + abFrom.length;
		} else {
			Check(Number.isInteger(pStart) && Number.isInteger(pEnd) && abFrom.byteOffset === 0);
			this.abBuffer.set(new Uint8Array(abFrom.buffer, pStart, pEnd - pStart), pTo);
			this.pEnd = pTo + pEnd - pStart;
		}
	}
}

class ID3 {
	constructor(abBuffer, pStart, pEnd) {
		var TAG_HEADER_SIZE = 10;
		var FIELD_HEADER_SIZE = 10;
		Check(abBuffer.BYTES_PER_ELEMENT === 1 && Number.isInteger(pStart) && Number.isInteger(pEnd) && pStart >= 0 && pStart <= pEnd);
		this._ab = abBuffer;
		this._pTagStart = -1;
		this._cbTagSize = -1;
		this._pFieldStart = -1;
		this._cbFieldSize = -1;
		var cbSize = pEnd - pStart;
		if (cbSize > TAG_HEADER_SIZE + FIELD_HEADER_SIZE && this._ab[pStart] === 73 && this._ab[pStart + 1] === 68 && this._ab[pStart + 2] === 51 && this._ab[pStart + 3] === 4 && this._ab[pStart + 5] === 0 && this._ParseSynchsafeInteger(pStart + 6) === cbSize - TAG_HEADER_SIZE) {
			this._pTagStart = pStart + TAG_HEADER_SIZE;
			this._cbTagSize = cbSize - TAG_HEADER_SIZE;
		}
	}
	_ParseSynchsafeInteger(pAddress) {
		var nResult = -1;
		var nByte = this._ab[pAddress];
		if (nByte < 128) {
			var n4Bytes = nByte << 24 - 3;
			nByte = this._ab[pAddress + 1];
			if (nByte < 128) {
				n4Bytes |= nByte << 16 - 2;
				nByte = this._ab[pAddress + 2];
				if (nByte < 128) {
					n4Bytes |= nByte << 8 - 1;
					nByte = this._ab[pAddress + 3];
					if (nByte < 128) {
						nResult = n4Bytes | nByte;
					}
				}
			}
		}
		return nResult;
	}
	_GetText() {
		if (this._cbFieldSize < 2 || this._ab[this._pFieldStart] !== 3) {
			return null;
		}
		if (ID3._oUtf8Decoder === null) {
			ID3._oUtf8Decoder = new TextDecoder('utf-8', {
				fatal: true
			});
		}
		try {
			return ID3._oUtf8Decoder.decode(new Uint8Array(this._ab.buffer, this._ab.byteOffset + this._pFieldStart + 1, this._cbFieldSize - 1));
		} catch (_) {
			return null;
		}
	}
	* [Symbol.iterator]() {
		var FIELD_HEADER_SIZE = 10;
		var pTag = this._pTagStart;
		var cbTag = this._cbTagSize;
		while (cbTag > FIELD_HEADER_SIZE) {
			var nCode1 = this._ab[pTag];
			var nCode2 = this._ab[pTag + 1];
			var nCode3 = this._ab[pTag + 2];
			var nCode4 = this._ab[pTag + 3];
			if ((nCode1 < 48 || nCode1 > 57) && (nCode1 < 65 || nCode1 > 90) || (nCode2 < 48 || nCode2 > 57) && (nCode2 < 65 || nCode2 > 90) || (nCode3 < 48 || nCode3 > 57) && (nCode3 < 65 || nCode3 > 90) || (nCode4 < 48 || nCode4 > 57) && (nCode4 < 65 || nCode4 > 90)) {
				break;
			}
			if (this._ab[pTag + 9] !== 0) {
				break;
			}
			var cbField = this._ParseSynchsafeInteger(pTag + 4);
			if (cbField < 1 || cbField > cbTag - FIELD_HEADER_SIZE) {
				break;
			}
			this._pFieldStart = pTag + FIELD_HEADER_SIZE;
			this._cbFieldSize = cbField;
			pTag += FIELD_HEADER_SIZE + cbField;
			cbTag -= FIELD_HEADER_SIZE + cbField;
			yield String.fromCharCode(nCode1, nCode2, nCode3, nCode4);
		}
		this._pFieldStart = -1;
		this._cbFieldSize = -1;
	}
	GetFirstString() {
		var sText = this._GetText();
		if (sText === null) {
			return null;
		}
		var nStringEnd = sText.indexOf('\0');
		if (nStringEnd === -1) {
			return null;
		}
		return sText.slice(0, nStringEnd);
	}
	ParseTXXX() {
		var sText = this._GetText();
		if (sText === null) {
			return null;
		}
		var nStringEnd = sText.indexOf('\0');
		if (nStringEnd === -1) {
			return null;
		}
		var sDescription = sText.slice(0, nStringEnd);
		var sValue = sText.slice(nStringEnd + 1);
		if (sValue.indexOf('\0') !== -1) {
			return null;
		}
		return {
			sDescription,
			sValue
		};
	}
}

ID3._oUtf8Decoder = null;

class Track {
	constructor(cbSampleStruct) {
		Check(Number.isInteger(cbSampleStruct) && cbSampleStruct >= 0);
		this.pStreamMemoryStart = 0;
		this.pStreamMemoryEnd = 0;
		this.pStreamStart = 0;
		this.pStreamEnd = 0;
		this.pSamplesMemoryEnd = 0;
		this.pSamplesStart = 0;
		this.pSamplesEnd = 0;
		this.cbSampleStruct = cbSampleStruct;
		this.nDtsStart = -1;
		this.nContinuityCounter = -1;
		this.pPesPacketEnd = -1;
	}
	IsEmpty() {
		return this.pStreamEnd === this.pStreamStart;
	}
	GetStreamSize() {
		Check(Number.isInteger(this.pStreamStart) && Number.isInteger(this.pStreamEnd) && this.pStreamStart >= 0 && this.pStreamStart <= this.pStreamEnd);
		Check(this.pStreamStart >= this.pStreamMemoryStart && this.pStreamEnd <= this.pStreamMemoryEnd);
		return this.pStreamEnd - this.pStreamStart;
	}
	GetSamplesSize() {
		Check(Number.isInteger(this.pSamplesStart) && Number.isInteger(this.pSamplesEnd) && this.pSamplesStart >= 0 && this.pSamplesStart <= this.pSamplesEnd);
		Check(this.pSamplesEnd <= this.pSamplesMemoryEnd);
		Check((this.pSamplesEnd - this.pSamplesStart) % this.cbSampleStruct == 0);
		return this.pSamplesEnd - this.pSamplesStart;
	}
	GetNumberOfSamples() {
		return this.GetSamplesSize() / this.cbSampleStruct;
	}
	GetSampleNumber(pSample) {
		Check(Number.isInteger(this.pSamplesStart) && Number.isInteger(this.pSamplesEnd) && this.pSamplesStart >= 0 && this.pSamplesStart <= this.pSamplesEnd);
		Check(this.pSamplesEnd <= this.pSamplesMemoryEnd);
		Check(Number.isInteger(pSample));
		if (this.IsEmpty() || pSample < this.pSamplesStart) {
			return NaN;
		}
		Check(pSample <= this.pSamplesEnd - this.cbSampleStruct);
		Check((pSample - this.pSamplesStart) % this.cbSampleStruct == 0);
		return (pSample - this.pSamplesStart) / this.cbSampleStruct;
	}
}

var m_Log = (() => {
	var _asImportance = [];
	var _asRecords = [];
	function Add(sImportance, sRecord) {
		_asImportance.push(sImportance);
		_asRecords.push(`[Worker] ${sRecord}`);
	}
	function Log(sRecord) {
		Add('Log', sRecord);
	}
	function LogInfo(sRecord) {
		Add('LogInfo', sRecord);
	}
	function LogError(sRecord) {
		Add('LogError', sRecord);
	}
	function Send() {
		if (_asImportance.length !== 0) {
			postMessage([ 2, _asImportance, _asRecords ]);
			_asImportance.length = 0;
			_asRecords.length = 0;
		}
	}
	return {
		Log,
		LogInfo,
		LogError,
		Send
	};
})();

{
	var TRANSPORT_PACKET_SIZE = 188;
	var TS_TIMESCALE = 9e4;
	var AUDIO_SAMPLE_LENGTH = 1024;
	var SAMPLING_FREQUENCY = [ 96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350 ];
	var VIDEO_TRACK_NUMBER = 1;
	var AUDIO_TRACK_NUMBER = 2;
	var AUDIO_SAMPLE_STRUCT_SIZE = 1 * 4;
	var VIDEO_SAMPLE_STRUCT_SIZE = 4 * 4;
	var VIDEO_SAMPLE_DURATION = 0;
	var VIDEO_SAMPLE_SIZE = 4;
	var VIDEO_SAMPLE_FLAGS = 8;
	var VIDEO_SAMPLE_VP = 12;
	var _aUnprocessedMessages = [];
	var _oSourceSegment = null;
	var _abHeap = null;
	var _acHeap = null;
	var _dvHeap = null;
	var _fFindPrefix = null;
	var _oAssembler = Wasm.IsAvailable() ? new Wasm() : new Asmjs();
	var _bDiscontinuity = true;
	var _oPat = null;
	var _oPmt = null;
	var _trkVideo = new Track(VIDEO_SAMPLE_STRUCT_SIZE);
	var _trkAudio = new Track(AUDIO_SAMPLE_STRUCT_SIZE);
	var _trkMetadata = new Track(0);
	var _apMetadataStart = [];
	var _nDtsLastVideoSample;
	var _nDtsVideoSegmentEnd;
	var _nDtsAudioSegmentEnd;
	var _nDtsLastVideoSamplePreviousVideoSegment;
	var _nDtsPreviousVideoSegmentEnd;
	var _nDtsPreviousAudioSegmentEnd;
	var _anDecoderSpecificInfo = [ 0, 0 ];
	var _abSequenceParameterSet;
	var _abPictureParameterSet;
	var _abSequenceParameterSetExt;
	var _nProfileIndication;
	var _nConstraintSetFlag;
	var _nLevelIndication;
	var _nChromaFormatIndication;
	var _nBitDepthLumaMinus8;
	var _nBitDepthChromaMinus8;
	var _nMaxNumberReferenceFrames;
	var _nImageWidth;
	var _nImageHeight;
	var _nFrameRate;
	var _nRange;
	var _bInterlaced;
	var _nAudioObjectType;
	var _nSamplingFrequency;
	var _nChannelCount;
	var _nConvertedIn = NaN;
	var _bRejected;
	var _bVideoLoss;
	var _bAudioLoss;
	var _nMinVideoSampleDuration;
	var _nMaxVideoSampleDuration;
	var _nAvgVideoSampleDuration;
	var _nAudioBitrate;
	var _nEncodingPosition;
	var _nBroadcastPosition;
	var _nEncodingTime;
	function ClearStatistics() {
		_bRejected = false;
		_bVideoLoss = false;
		_bAudioLoss = false;
		_nMinVideoSampleDuration = +Infinity;
		_nMaxVideoSampleDuration = -Infinity;
		_nAvgVideoSampleDuration = NaN;
		_nAudioBitrate = NaN;
		_nEncodingPosition = NaN;
		_nBroadcastPosition = NaN;
		_nEncodingTime = NaN;
	}
	function Reject(pCondition) {
		if (!pCondition) {
			throw new Error('REJECT');
		}
	}
	function Ms(nTimeTP, sUnits = 'ms') {
		return `${(nTimeTP / (TS_TIMESCALE / 1e3)).toFixed(2)}${sUnits}`;
	}
	function SendResult(abufTransfer) {
		postMessage([ 1, _oSourceSegment ], abufTransfer);
	}
	function TerminateAndShowMessage(sMessageCode) {
		postMessage([ 4, sMessageCode ]);
		throw void 0;
	}
	function TerminateAndSendReport(pException) {
		var sReasonForTermination = pException instanceof Error ? `Exception caught in worker thread: ${pException.stack}` : `Exception caught in worker thread: [typeof ${typeof pException}] ${new Error(pException).stack}`;
		if (typeof _oSourceSegment == 'object' && _oSourceSegment !== null && typeof _oSourceSegment.pData == 'object' && _oSourceSegment.pData !== null && _oSourceSegment.pData.byteLength) {
			postMessage([ 3, sReasonForTermination, _oSourceSegment.pData ], [ _oSourceSegment.pData ]);
		} else {
			postMessage([ 3, sReasonForTermination, null ]);
		}
		_oSourceSegment = null;
	}
	function ThrowInTheTrash(abTrash) {
		if (isMobileDevice() || getBrowserEngineVersion() >= 64) {
			return;
		}
		if (abTrash && abTrash.buffer.byteLength) {
			Check(_abHeap === null || _abHeap.buffer !== abTrash.buffer);
			postMessage([ 5, abTrash.buffer ], [ abTrash.buffer ]);
		}
	}
	var m_Memory = (() => {
		var MAX_SEGMENT_DURATION = 30;
		var MAX_FRAME_RATE = 150;
		var MAX_NAL_UNITS_PER_FRAME = 10;
		var RESERVE = 1.4;
		var ALIGN_TO_BYTES = 1 << 6;
		var ASSEMBLER_DATA_SIZE = Align(4);
		var VIDEO_SAMPLES_MEMORY_SIZE = Align(VIDEO_SAMPLE_STRUCT_SIZE * MAX_FRAME_RATE * MAX_SEGMENT_DURATION);
		var AUDIO_SAMPLES_MEMORY_SIZE = Align(AUDIO_SAMPLE_STRUCT_SIZE * SAMPLING_FREQUENCY[0] / AUDIO_SAMPLE_LENGTH * MAX_SEGMENT_DURATION);
		var MEDIA_STREAM_MEMORY_SIZE = Align(1e4);
		var VIDEO_STREAM_RESERVE_SIZE = Align(MAX_NAL_UNITS_PER_FRAME * MAX_FRAME_RATE * MAX_SEGMENT_DURATION);
		function Align(pAddressOrSize) {
			return Math.ceil(pAddressOrSize) + (ALIGN_TO_BYTES - 1) & ~(ALIGN_TO_BYTES - 1);
		}
		function Allocate(abTransportStream) {
			var pAllocate = ASSEMBLER_DATA_SIZE;
			_trkVideo.pSamplesStart = _trkVideo.pSamplesEnd = pAllocate;
			_trkVideo.pSamplesMemoryEnd = pAllocate += VIDEO_SAMPLES_MEMORY_SIZE;
			_trkAudio.pSamplesStart = _trkAudio.pSamplesEnd = pAllocate;
			_trkAudio.pSamplesMemoryEnd = pAllocate += AUDIO_SAMPLES_MEMORY_SIZE;
			_trkMetadata.pStreamMemoryStart = _trkMetadata.pStreamStart = _trkMetadata.pStreamEnd = pAllocate;
			_trkMetadata.pStreamMemoryEnd = pAllocate += MEDIA_STREAM_MEMORY_SIZE;
			_trkVideo.pStreamMemoryStart = pAllocate;
			_trkVideo.pStreamStart = _trkVideo.pStreamEnd = pAllocate += VIDEO_STREAM_RESERVE_SIZE;
			var cbConstantSize = pAllocate;
			_trkVideo.pStreamMemoryEnd = pAllocate += Align(abTransportStream.length);
			_trkAudio.pStreamMemoryStart = _trkAudio.pStreamStart = _trkAudio.pStreamEnd = pAllocate;
			_trkAudio.pStreamMemoryEnd = pAllocate += Align(abTransportStream.length);
			var cbVariableSize = pAllocate - cbConstantSize;
			if (_abHeap === null || _abHeap.length < pAllocate) {
				var cbHeapSize = cbConstantSize + cbVariableSize * RESERVE;
				if (_abHeap === null) {
					m_Log.Log(`Creating heap ${cbHeapSize} bytes`);
				} else {
					m_Log.LogError(`Increasing heap from ${_abHeap.length} to ${cbHeapSize} bytes`);
				}
				var [bufHeap, oExport] = _oAssembler.AllocateMemory(cbHeapSize);
				_abHeap = new Uint8Array(bufHeap);
				_acHeap = new Int32Array(bufHeap);
				_dvHeap = CreateDataView(_abHeap);
				_fFindPrefix = oExport.SearchStartCodePrefix;
			}
		}
		function Free() {
			_oAssembler.FreeMemory();
			_abHeap = null;
			_acHeap = null;
			_dvHeap = null;
			_fFindPrefix = null;
		}
		return {
			Allocate,
			Free
		};
	})();
	function ParseTransportStream(abTransportStream) {
		Reject(abTransportStream.length !== 0 && abTransportStream.length % TRANSPORT_PACKET_SIZE == 0);
		_trkVideo.nDtsStart = _trkAudio.nDtsStart = -1;
		_trkMetadata.nDtsStart = 0;
		_trkVideo.pPesPacketEnd = _trkAudio.pPesPacketEnd = _trkMetadata.pPesPacketEnd = -1;
		_apMetadataStart.length = 0;
		_nDtsLastVideoSample = -1;
		if (_bDiscontinuity) {
			_trkVideo.nContinuityCounter = _trkAudio.nContinuityCounter = _trkMetadata.nContinuityCounter = -1;
			_oPat = _oPmt = null;
		}
		var nPmtPid = -1, nVideoPid = -1, nAudioPid = -1, nMetadataPid = -1;
		var cPat = 0, cPmt = 0, nDtsChanges = 0;
		var pTransportPacket = _trkVideo.pStreamStart | 0;
		_abHeap.set(abTransportStream, pTransportPacket);
		for (var pTransportStreamEnd = pTransportPacket + abTransportStream.length; pTransportPacket !== pTransportStreamEnd; pTransportPacket += TRANSPORT_PACKET_SIZE) {
			var nTransportPacketHeader = _dvHeap.getUint32(pTransportPacket) | 0;
			Reject((nTransportPacketHeader & 4286578880) == 1191182336);
			var nPid = (nTransportPacketHeader & 2096896) >> 8;
			var pPayload = pTransportPacket + 4;
			if ((nTransportPacketHeader & 32) != 0) {
				var cbAdaptationField = _abHeap[pPayload];
				Check(cbAdaptationField <= TRANSPORT_PACKET_SIZE - 5);
				Check(cbAdaptationField === 0 || (_abHeap[pPayload + 1] & 128) == 0);
				pPayload += 1 + cbAdaptationField;
			}
			var trkToProcess;
			switch (nPid) {
			  case nVideoPid:
				if ((nTransportPacketHeader & 4194304) != 0) {
					Check((_dvHeap.getUint32(pPayload) & 4294967280) == 480);
				}
				trkToProcess = _trkVideo;
				break;

			  case nAudioPid:
				if ((nTransportPacketHeader & 4194304) != 0) {
					Check((_dvHeap.getUint32(pPayload) & 4294967264) == 448);
				}
				trkToProcess = _trkAudio;
				break;

			  case nMetadataPid:
				if ((nTransportPacketHeader & 4194304) != 0) {
					Check(_dvHeap.getUint32(pPayload) === 445);
					Check((_abHeap[pPayload + 6] & 4) != 0);
					Check((_abHeap[pPayload + 7] & 192) == 128);
					_apMetadataStart.push(_trkMetadata.pStreamEnd);
				}
				trkToProcess = _trkMetadata;
				break;

			  case 0:
				Check((nTransportPacketHeader & 4194320) == 4194320);
				var oPat = new ProgramAssociationTable(pPayload, pTransportPacket + TRANSPORT_PACKET_SIZE);
				if (_oPat === null) {
					_oPat = oPat;
					m_Log.Log(`PatVersion=${oPat.nPatVersion} ProgramNumber=${oPat.nProgramNumber} PmtPid=${oPat.nPmtPid}`);
				} else {
					Check(_oPat.nPatVersion === oPat.nPatVersion && _oPat.nProgramNumber === oPat.nProgramNumber && _oPat.nPmtPid === oPat.nPmtPid);
				}
				nPmtPid = oPat.nPmtPid;
				++cPat;
				continue;

			  case nPmtPid:
				Check((nTransportPacketHeader & 4194320) == 4194320);
				var oPmt = new ProgramMapTable(pPayload, pTransportPacket + TRANSPORT_PACKET_SIZE, _oPat.nProgramNumber);
				if (_oPmt === null) {
					_oPmt = oPmt;
					m_Log.Log(`PmtVersion=${oPmt.nPmtVersion} VideoPid=${oPmt.nVideoPid} AudioPid=${oPmt.nAudioPid} MetadataPid=${oPmt.nMetadataPid}`);
				} else {
					Check(_oPmt.nPmtVersion === oPmt.nPmtVersion && _oPmt.nVideoPid === oPmt.nVideoPid && _oPmt.nAudioPid === oPmt.nAudioPid && _oPmt.nMetadataPid === oPmt.nMetadataPid);
				}
				({nVideoPid, nAudioPid, nMetadataPid} = oPmt);
				++cPmt;
				continue;

			  default:
				continue;
			}
			if (trkToProcess.nContinuityCounter !== (nTransportPacketHeader & 15) && trkToProcess.nContinuityCounter !== -1) {
				m_Log.LogError(`continuity_counter is ${nTransportPacketHeader & 15} instead of ${trkToProcess.nContinuityCounter} PID=${nPid} PacketOffset=${abTransportStream.length - pTransportStreamEnd + pTransportPacket}`);
				Reject(trkToProcess.pStreamEnd === trkToProcess.pStreamStart);
			}
			trkToProcess.nContinuityCounter = nTransportPacketHeader + 1 & 15;
			switch (nTransportPacketHeader & 4194320) {
			  case 16:
				Check(trkToProcess.pStreamEnd !== trkToProcess.pStreamStart);
				break;

			  case 4194320:
				var cbPesPacket = _dvHeap.getUint16(pPayload + 4);
				var cbPesHeader = _abHeap[pPayload + 8];
				Check(trkToProcess.pPesPacketEnd === trkToProcess.pStreamEnd || trkToProcess.pPesPacketEnd === -1);
				if (cbPesPacket !== 0) {
					trkToProcess.pPesPacketEnd = trkToProcess.pStreamEnd + cbPesPacket - 3 - cbPesHeader;
				} else {
					Check(nPid === nVideoPid);
					trkToProcess.pPesPacketEnd = -1;
				}
				if (nPid === nVideoPid || trkToProcess.nDtsStart === -1) {
					var nPts, nDts;
					switch (_dvHeap.getUint16(pPayload + 6) & 61632) {
					  case 32896:
						Check(cbPesHeader >= 5);
						nPts = DecodeTimestamp(pPayload + 9, 33);
						nDts = nPts;
						break;

					  case 32960:
						Check(cbPesHeader >= 10);
						nPts = DecodeTimestamp(pPayload + 9, 49);
						nDts = DecodeTimestamp(pPayload + 14, 17);
						break;

					  default:
						Check(false);
					}
					if (trkToProcess.nDtsStart === -1) {
						trkToProcess.nDtsStart = nDts;
					}
					if (nPid === nVideoPid) {
						if (nDts === _nDtsLastVideoSample && cbPesPacket !== 0) {
							Check((_abHeap[pPayload + 6] & 4) == 0);
						} else {
							Check(_trkVideo.pSamplesEnd <= _trkVideo.pSamplesMemoryEnd - VIDEO_SAMPLE_STRUCT_SIZE);
							if (_nDtsLastVideoSample !== -1) {
								var nVideoSampleDuration = nDts - _nDtsLastVideoSample;
								if (nVideoSampleDuration <= 0) {
									if (nVideoSampleDuration > -10) {
										nVideoSampleDuration = 1;
										nDts = _nDtsLastVideoSample + nVideoSampleDuration;
										++nDtsChanges;
									} else {
										Reject(false);
									}
								}
								Check(nVideoSampleDuration < TS_TIMESCALE * 60);
								_nMinVideoSampleDuration = Math.min(_nMinVideoSampleDuration, nVideoSampleDuration);
								_nMaxVideoSampleDuration = Math.max(_nMaxVideoSampleDuration, nVideoSampleDuration);
								_dvHeap.setUint32(_trkVideo.pSamplesEnd + VIDEO_SAMPLE_DURATION - VIDEO_SAMPLE_STRUCT_SIZE, nVideoSampleDuration);
								_dvHeap.setUint32(_trkVideo.pSamplesEnd + VIDEO_SAMPLE_SIZE - VIDEO_SAMPLE_STRUCT_SIZE, _trkVideo.pStreamEnd);
							}
							_dvHeap.setInt32(_trkVideo.pSamplesEnd + VIDEO_SAMPLE_VP, nPts - nDts);
							_trkVideo.pSamplesEnd += VIDEO_SAMPLE_STRUCT_SIZE;
							_nDtsLastVideoSample = nDts;
						}
					} else {
						Check(nPts === nDts);
					}
				}
				pPayload += 9 + cbPesHeader;
				break;

			  default:
				Check(false);
			}
			var cbPayload = pTransportPacket + TRANSPORT_PACKET_SIZE - pPayload;
			Check(cbPayload > 0 && cbPayload + trkToProcess.pStreamEnd <= trkToProcess.pStreamMemoryEnd);
			_abHeap.copyWithin(trkToProcess.pStreamEnd, pPayload, pPayload + cbPayload);
			trkToProcess.pStreamEnd += cbPayload;
		}
		Check(_trkVideo.pPesPacketEnd === _trkVideo.pStreamEnd || _trkVideo.pPesPacketEnd === -1);
		Check(_trkAudio.pPesPacketEnd === _trkAudio.pStreamEnd || _trkAudio.pPesPacketEnd === -1);
		Check(_trkMetadata.pPesPacketEnd === _trkMetadata.pStreamEnd || _trkMetadata.pPesPacketEnd === -1);
		if (cPat !== 1 || cPmt !== 1) {
			m_Log.LogError(`Number of tables in segment: PAT=${cPat} PMT=${cPmt}`);
		}
		if (nDtsChanges !== 0) {
			m_Log.LogError(`Number of video samples with increased DTS: ${nDtsChanges}`);
		}
		Check(nVideoPid !== -1 || nAudioPid !== -1);
		_bVideoLoss = nVideoPid !== -1 && _trkVideo.IsEmpty();
		_bAudioLoss = nAudioPid !== -1 && _trkAudio.IsEmpty();
		if (_bVideoLoss || _bAudioLoss) {
			m_Log.LogError(`Segment is not suitable for playback: no video ${_bVideoLoss}, no audio ${_bAudioLoss}`);
			return false;
		}
		var sImportance = _apMetadataStart.length > 1 ? 'LogError' : 'Log';
		var sRecord = `Metadata=${_apMetadataStart.length}`;
		if (!_trkVideo.IsEmpty()) {
			_dvHeap.setUint32(_trkVideo.pSamplesEnd + VIDEO_SAMPLE_SIZE - VIDEO_SAMPLE_STRUCT_SIZE, _trkVideo.pStreamEnd);
			var nVideoSamples = _trkVideo.GetNumberOfSamples();
			_nAvgVideoSampleDuration = (_nDtsLastVideoSample - _trkVideo.nDtsStart) / (nVideoSamples - 1);
			if (nVideoSamples < 25) {
				sImportance = 'LogError';
			}
			sRecord += ` DtsFirstVidSample=${(_trkVideo.nDtsStart / TS_TIMESCALE).toFixed(5)}` + ` DtsLastVidSample=${(_nDtsLastVideoSample / TS_TIMESCALE).toFixed(5)}` + ` DurVidSegment>${Ms(_nDtsLastVideoSample - _trkVideo.nDtsStart)} VidSamples=${nVideoSamples}` + ` DurVidSamples=${Ms(_nMinVideoSampleDuration, '')}<${Ms(_nAvgVideoSampleDuration, '')}<${Ms(_nMaxVideoSampleDuration)}` + `(${(TS_TIMESCALE / _nMinVideoSampleDuration).toFixed(2)}` + `<${(TS_TIMESCALE / _nAvgVideoSampleDuration).toFixed(2)}` + `<${(TS_TIMESCALE / _nMaxVideoSampleDuration).toFixed(2)}fps)`;
		}
		if (!_trkAudio.IsEmpty()) {
			sRecord += ` DtsFirstAudSample=${(_trkAudio.nDtsStart / TS_TIMESCALE).toFixed(5)}`;
		}
		if (!_trkVideo.IsEmpty() && !_trkAudio.IsEmpty()) {
			var nAudioOffset = _trkAudio.nDtsStart - _trkVideo.nDtsStart;
			if (nAudioOffset < -TS_TIMESCALE * .1 || nAudioOffset > TS_TIMESCALE * .2) {
				sImportance = 'LogError';
			}
			sRecord += ` OffsetStartAudSegment=${Ms(_trkAudio.nDtsStart - _trkVideo.nDtsStart)}`;
		}
		m_Log[sImportance](sRecord);
		_nEncodingPosition = (_trkAudio.nDtsStart !== -1 ? _trkAudio.nDtsStart : _trkVideo.nDtsStart) / TS_TIMESCALE;
		return true;
	}
	function DecodeTimestamp(pAddress, nMarkerBits) {
		var n1 = _abHeap[pAddress] | 0;
		var n2 = _dvHeap.getUint32(pAddress + 1) | 0;
		Check((n1 & 241) == (nMarkerBits | 0) && (n2 & 65537) == 65537);
		return +((n1 & 14) * (1 << 29) + (n2 >> 2 & 1073709056 | n2 >> 1 & 32767));
	}
	function ProgramAssociationTable(pStart, pEnd) {
		Check(pStart < pEnd);
		pStart += 1 + _abHeap[pStart];
		Check(pEnd - pStart >= 16);
		Check(_abHeap[pStart] === 0);
		Check((_dvHeap.getUint16(pStart + 1) & 53247) == 32781);
		Check((_abHeap[pStart + 5] & 1) == 1);
		var nPatVersion = _abHeap[pStart + 5] & 62;
		Check(_abHeap[pStart + 6] === 0);
		Check(_abHeap[pStart + 7] === 0);
		var nProgramNumber = _dvHeap.getUint16(pStart + 8);
		Check(nProgramNumber !== 0);
		var nPmtPid = _dvHeap.getUint16(pStart + 10) & 8191;
		Check(nPmtPid >= 16 && nPmtPid <= 8190);
		this.nPatVersion = nPatVersion;
		this.nProgramNumber = nProgramNumber;
		this.nPmtPid = nPmtPid;
	}
	function ProgramMapTable(pStart, pEnd, nProgramNumber) {
		Check(pStart < pEnd);
		pStart += 1 + _abHeap[pStart];
		Check(pEnd - pStart >= 12);
		Check(_abHeap[pStart] === 2);
		var pSectionEnd = _dvHeap.getUint16(pStart + 1);
		Check((pSectionEnd & 49152) == 32768);
		pSectionEnd = pStart + 3 + (pSectionEnd & 4095) - 4;
		Check(pSectionEnd >= pStart + 12 && pSectionEnd + 4 <= pEnd);
		Check(_dvHeap.getUint16(pStart + 3) === nProgramNumber);
		Check((_abHeap[pStart + 5] & 1) == 1);
		var nPmtVersion = _abHeap[pStart + 5] & 62;
		Check(_abHeap[pStart + 6] === 0);
		Check(_abHeap[pStart + 7] === 0);
		pStart += 12 + (_dvHeap.getUint16(pStart + 10) & 4095);
		var nVideoPid = -1, nAudioPid = -1, nMetadataPid = -1;
		while (pStart !== pSectionEnd) {
			var pDescriptor = pStart + 5;
			Check(pDescriptor <= pSectionEnd);
			var nElementaryPid = _dvHeap.getUint16(pStart + 1) & 8191;
			Check(nElementaryPid >= 16 && nElementaryPid <= 8190);
			var nEsInfoLength = _dvHeap.getUint16(pStart + 3) & 4095;
			Check(pDescriptor + nEsInfoLength <= pSectionEnd);
			switch (_abHeap[pStart]) {
			  case 27:
				if (nVideoPid === -1) {
					nVideoPid = nElementaryPid;
				} else {
					m_Log.LogError(`Found additional video stream PID=${nElementaryPid}`);
				}
				break;

			  case 15:
				if (nAudioPid === -1) {
					nAudioPid = nElementaryPid;
				} else {
					m_Log.LogError(`Found additional audio stream PID=${nElementaryPid}`);
				}
				break;

			  case 21:
				if (nEsInfoLength === 15 && _abHeap[pDescriptor] === 38 && _abHeap[pDescriptor + 1] === 13 && _abHeap[pDescriptor + 2] === 255 && _abHeap[pDescriptor + 3] === 255 && _abHeap[pDescriptor + 4] === 73 && _abHeap[pDescriptor + 5] === 68 && _abHeap[pDescriptor + 6] === 51 && _abHeap[pDescriptor + 7] === 32 && _abHeap[pDescriptor + 8] === 255 && _abHeap[pDescriptor + 9] === 73 && _abHeap[pDescriptor + 10] === 68 && _abHeap[pDescriptor + 11] === 51 && _abHeap[pDescriptor + 12] === 32) {
					if (nMetadataPid === -1) {
						nMetadataPid = nElementaryPid;
					} else {
						m_Log.LogError(`Found additional metadata stream PID=${nElementaryPid} metadata_service_id=${_abHeap[pDescriptor + 13]}`);
					}
				}
			}
			pStart = pDescriptor + nEsInfoLength;
		}
		this.nPmtVersion = nPmtVersion;
		this.nVideoPid = nVideoPid;
		this.nAudioPid = nAudioPid;
		this.nMetadataPid = nMetadataPid;
	}
	function ParseMetadata() {
		for (var i = 0; i < _apMetadataStart.length; i++) {
			var oID3 = new ID3(_abHeap, _apMetadataStart[i], _apMetadataStart[i + 1] || _trkMetadata.pStreamEnd);
			for (var sFieldId of oID3) {
				if (sFieldId === 'TXXX') {
					var {sDescription, sValue} = oID3.ParseTXXX();
					if (sDescription === 'segmentmetadata') {
						var oMetadata = JSON.parse(sValue);
						if (Number.isFinite(oMetadata.transc_r)) {
							Check(oMetadata.transc_r > 14200704e5 && oMetadata.transc_r < 18468864e5);
							_nEncodingTime = oMetadata.transc_r;
						}
						if (Number.isFinite(oMetadata.stream_offset)) {
							Check(oMetadata.stream_offset >= 0);
							_nBroadcastPosition = oMetadata.stream_offset;
						}
						return;
					}
				}
			}
		}
	}
	function ParseVideoStream() {
		if (_bDiscontinuity) {
			_abSequenceParameterSet = null;
			_abPictureParameterSet = null;
			_abSequenceParameterSetExt = null;
		}
		if (_trkVideo.IsEmpty()) {
			return true;
		}
		var NORMAL_FRAME_FLAGS = 65536;
		var KEY_FRAME_FLAGS = 0;
		Check(_trkVideo.pStreamStart > _trkVideo.pStreamMemoryStart && _trkVideo.pStreamEnd > _trkVideo.pStreamStart && _trkVideo.pSamplesEnd > _trkVideo.pSamplesStart);
		var pParsedStream = _trkVideo.pStreamMemoryStart;
		var pFirstKeyFrameSample = -1;
		var cNalUnits = 0, cAccessUnits = 0, nSamplesWithoutVCL = 0, nKeyFrames = 0, pLastKeyFrameSample = -1;
		var pSample = _trkVideo.pSamplesStart;
		var pNextSampleStart = -1;
		var pParsedSampleStart;
		var nSampleFlags;
		var pNalUnitEnd = _fFindPrefix(_trkVideo.pStreamStart, _trkVideo.pStreamEnd);
		Check(pNalUnitEnd === _trkVideo.pStreamStart);
		Check(_acHeap[0] > 3);
		for (;;) {
			var cbPrefixSize = pNalUnitEnd === _trkVideo.pStreamEnd ? 0 : _acHeap[0];
			var bSampleStart = pNalUnitEnd + cbPrefixSize - Math.min(4, cbPrefixSize) >= pNextSampleStart;
			if (bSampleStart && pNextSampleStart !== -1) {
				if (nSampleFlags === -1) {
					nSampleFlags = NORMAL_FRAME_FLAGS;
					++nSamplesWithoutVCL;
				}
				Check(pParsedStream > pParsedSampleStart);
				_dvHeap.setUint32(pSample + VIDEO_SAMPLE_SIZE, pParsedStream - pParsedSampleStart);
				_dvHeap.setUint32(pSample + VIDEO_SAMPLE_FLAGS, nSampleFlags);
				pSample += VIDEO_SAMPLE_STRUCT_SIZE;
			}
			if (pNalUnitEnd === _trkVideo.pStreamEnd) {
				Check(pSample === _trkVideo.pSamplesEnd);
				break;
			}
			var pNalUnitBegin = pNalUnitEnd + cbPrefixSize;
			pNalUnitEnd = _fFindPrefix(pNalUnitBegin, _trkVideo.pStreamEnd);
			Reject(pNalUnitEnd >= pNalUnitBegin);
			if (bSampleStart) {
				Check(pSample < _trkVideo.pSamplesEnd);
				pNextSampleStart = _dvHeap.getUint32(pSample + VIDEO_SAMPLE_SIZE);
				pParsedSampleStart = pParsedStream;
				nSampleFlags = -1;
				if (cAccessUnits === 1) {
					cAccessUnits = 0;
				}
			}
			if (pNalUnitBegin === pNalUnitEnd) {
				continue;
			}
			++cNalUnits;
			var nNalRefIdc = _abHeap[pNalUnitBegin] & 224;
			Reject(nNalRefIdc < 128);
			switch (_abHeap[pNalUnitBegin] & 31) {
			  case 1:
			  case 2:
			  case 3:
			  case 4:
				Check(nSampleFlags !== KEY_FRAME_FLAGS);
				nSampleFlags = NORMAL_FRAME_FLAGS;
				break;

			  case 5:
				Check(nNalRefIdc !== 0);
				if (nSampleFlags !== KEY_FRAME_FLAGS) {
					Check(nSampleFlags !== NORMAL_FRAME_FLAGS);
					nSampleFlags = KEY_FRAME_FLAGS;
					if (pFirstKeyFrameSample === -1) {
						pFirstKeyFrameSample = pSample;
					}
					pLastKeyFrameSample = pSample;
					++nKeyFrames;
				}
				break;

			  case 6:
				Check(nNalRefIdc === 0);
				break;

			  case 7:
				Check(nNalRefIdc !== 0);
				if (_bDiscontinuity && (pFirstKeyFrameSample === -1 || _abSequenceParameterSet === null)) {
					_abSequenceParameterSet = _abHeap.slice(pNalUnitBegin, pNalUnitEnd);
				}
				continue;

			  case 8:
				Check(nNalRefIdc !== 0);
				if (_bDiscontinuity && (pFirstKeyFrameSample === -1 || _abPictureParameterSet === null)) {
					_abPictureParameterSet = _abHeap.slice(pNalUnitBegin, pNalUnitEnd);
				}
				continue;

			  case 9:
				Check(nNalRefIdc === 0);
				++cAccessUnits;
				continue;

			  case 10:
				Check(nNalRefIdc === 0);
				continue;

			  case 11:
				Check(nNalRefIdc === 0);
				Check(false);
				continue;

			  case 12:
				Check(nNalRefIdc === 0);
				continue;

			  case 13:
				Check(nNalRefIdc !== 0);
				Check(false);
				if (_bDiscontinuity && (pFirstKeyFrameSample === -1 || _abSequenceParameterSetExt === null)) {
					_abSequenceParameterSetExt = _abHeap.slice(pNalUnitBegin, pNalUnitEnd);
				}
				continue;
			}
			var cbNalUnit = pNalUnitEnd - pNalUnitBegin;
			_dvHeap.setUint32(pParsedStream, cbNalUnit);
			pParsedStream += 4;
			Check(pParsedStream < pNalUnitBegin);
			_abHeap.copyWithin(pParsedStream, pNalUnitBegin, pNalUnitEnd);
			pParsedStream += cbNalUnit;
		}
		_trkVideo.pStreamStart = _trkVideo.pStreamMemoryStart;
		_trkVideo.pStreamEnd = pParsedStream;
		m_Log.Log('NalUnits=' + cNalUnits + ' KeyFrames=' + nKeyFrames + ' FirstKeyFrame=' + _trkVideo.GetSampleNumber(pFirstKeyFrameSample) + ' LastKeyFrame=' + _trkVideo.GetSampleNumber(pLastKeyFrameSample));
		if (nSamplesWithoutVCL !== 0) {
			m_Log.LogError(`Video samples without VCL NAL unit: ${nSamplesWithoutVCL}`);
		}
		if (cAccessUnits > 1) {
			m_Log.LogError('Multiple access units in one video sample');
		}
		if (_bDiscontinuity) {
			if (pFirstKeyFrameSample === -1 || _abSequenceParameterSet === null || _abPictureParameterSet === null) {
				m_Log.LogError(`Segment is not suitable for playback: IDR not found ${pFirstKeyFrameSample === -1}, SPS not found ${_abSequenceParameterSet === null}, PPS not found ${_abPictureParameterSet === null}`);
				return false;
			}
			var abCopy = _abSequenceParameterSet.slice();
			var o = RemoveEmulationPreventionBytesFromNalUnit(abCopy, 0, abCopy.length);
			ParseSequenceParameterSet(abCopy, o.pRbspStart, o.pRbspEnd);
		} else if (MAKE_FIRST_FRAME_KEY && pFirstKeyFrameSample !== _trkVideo.pSamplesStart) {
			m_Log.LogError('Making the first video sample a keyframe');
			_dvHeap.setUint32(_trkVideo.pSamplesStart + VIDEO_SAMPLE_FLAGS, KEY_FRAME_FLAGS);
		}
		return true;
	}
	function ParseSequenceParameterSet(abStream, pStart, pEnd) {
		_nProfileIndication = abStream[pStart];
		_nConstraintSetFlag = abStream[pStart + 1];
		_nLevelIndication = abStream[pStart + 2];
		var oBitStream = new BitStream(abStream, pStart + 3, pEnd);
		oBitStream.SkipExpGolomb();
		var nSeparateColourPlaneFlag = 0;
		_nChromaFormatIndication = 1;
		_nBitDepthLumaMinus8 = 0;
		_nBitDepthChromaMinus8 = 0;
		switch (_nProfileIndication) {
		  case 183:
			_nChromaFormatIndication = 0;
			break;

		  case 100:
		  case 110:
		  case 122:
		  case 244:
		  case 44:
		  case 83:
		  case 86:
		  case 118:
		  case 128:
		  case 138:
		  case 139:
		  case 134:
			_nChromaFormatIndication = oBitStream.ReadUnsignedExpGolomb();
			Check(_nChromaFormatIndication <= 3);
			if (_nChromaFormatIndication === 3) {
				nSeparateColourPlaneFlag = oBitStream.ReadBits(1);
			}
			_nBitDepthLumaMinus8 = oBitStream.ReadUnsignedExpGolomb();
			Check(_nBitDepthLumaMinus8 <= 6);
			_nBitDepthChromaMinus8 = oBitStream.ReadUnsignedExpGolomb();
			Check(_nBitDepthChromaMinus8 <= 6);
			oBitStream.SkipBits(1);
			if (oBitStream.ReadBits(1) !== 0) {
				for (var i = 0, ic = _nChromaFormatIndication !== 3 ? 8 : 12; i < ic; ++i) {
					if (oBitStream.ReadBits(1) !== 0) {
						var nLastScale = 8, nNextScale = 8;
						for (var j = 0, jc = i < 6 ? 16 : 64; j < jc; ++j) {
							if (nNextScale !== 0) {
								nNextScale = (nLastScale + oBitStream.ReadSignedExpGolomb() + 256) % 256;
							}
							if (nNextScale !== 0) {
								nLastScale = nNextScale;
							}
						}
					}
				}
			}
		}
		oBitStream.SkipExpGolomb();
		switch (oBitStream.ReadUnsignedExpGolomb()) {
		  case 0:
			oBitStream.SkipExpGolomb();
			break;

		  case 1:
			oBitStream.SkipBits(1);
			oBitStream.SkipExpGolomb();
			oBitStream.SkipExpGolomb();
			for (i = 0, ic = oBitStream.ReadUnsignedExpGolomb(); i < ic; ++i) {
				oBitStream.SkipExpGolomb();
			}
		}
		_nMaxNumberReferenceFrames = oBitStream.ReadUnsignedExpGolomb();
		oBitStream.SkipBits(1);
		var nPictureWidthInMacroblocks = oBitStream.ReadUnsignedExpGolomb() + 1;
		var nPictureHeightInMapUnits = oBitStream.ReadUnsignedExpGolomb() + 1;
		var nFrameMacroblocksOnlyFlag = oBitStream.ReadBits(1);
		if (nFrameMacroblocksOnlyFlag === 0) {
			oBitStream.SkipBits(1);
		}
		oBitStream.SkipBits(1);
		var nFrameCropLeftOffset = 0;
		var nFrameCropRightOffset = 0;
		var nFrameCropTopOffset = 0;
		var nFrameCropBottomOffset = 0;
		if (oBitStream.ReadBits(1) !== 0) {
			nFrameCropLeftOffset = oBitStream.ReadUnsignedExpGolomb();
			nFrameCropRightOffset = oBitStream.ReadUnsignedExpGolomb();
			nFrameCropTopOffset = oBitStream.ReadUnsignedExpGolomb();
			nFrameCropBottomOffset = oBitStream.ReadUnsignedExpGolomb();
		}
		_nFrameRate = 0;
		_nRange = -1;
		if (oBitStream.ReadBits(1) !== 0) {
			var nAspectRatioIndication;
			if (oBitStream.ReadBits(1) !== 0) {
				nAspectRatioIndication = oBitStream.ReadBits(8);
				if (nAspectRatioIndication === 255) {
					oBitStream.ReadBits(16);
					oBitStream.ReadBits(16);
				}
			}
			if (oBitStream.ReadBits(1) !== 0) {
				oBitStream.SkipBits(1);
			}
			if (oBitStream.ReadBits(1) !== 0) {
				oBitStream.ReadBits(3);
				_nRange = oBitStream.ReadBits(1);
				if (oBitStream.ReadBits(1) !== 0) {
					oBitStream.SkipBits(8 + 8 + 8);
				}
			}
			if (oBitStream.ReadBits(1) !== 0) {
				oBitStream.SkipExpGolomb();
				oBitStream.SkipExpGolomb();
			}
			var nNumUnitsInTick, nTimeScale, nFixedFrameRateFlag;
			if (oBitStream.ReadBits(1) !== 0) {
				nNumUnitsInTick = oBitStream.ReadBits(32);
				nTimeScale = oBitStream.ReadBits(32);
				nFixedFrameRateFlag = oBitStream.ReadBits(1);
				_nFrameRate = nTimeScale / nNumUnitsInTick / (nFixedFrameRateFlag === 0 ? -2 : 2);
			}
		}
		var nCropUnitX = 1;
		var nCropUnitY = 1;
		if (nSeparateColourPlaneFlag === 0 && _nChromaFormatIndication !== 0) {
			nCropUnitX = _nChromaFormatIndication === 3 ? 1 : 2;
			nCropUnitY = _nChromaFormatIndication === 1 ? 2 : 1;
		}
		if (nFrameMacroblocksOnlyFlag === 0) {
			nCropUnitY += nCropUnitY;
			nPictureHeightInMapUnits += nPictureHeightInMapUnits;
		}
		_nImageWidth = nPictureWidthInMacroblocks * 16 - nCropUnitX * nFrameCropRightOffset - nCropUnitX * nFrameCropLeftOffset;
		_nImageHeight = nPictureHeightInMapUnits * 16 - nCropUnitY * nFrameCropBottomOffset - nCropUnitY * nFrameCropTopOffset;
		_bInterlaced = nFrameMacroblocksOnlyFlag === 0;
	}
	function RemoveEmulationPreventionBytesFromNalUnit(abStream, pStart, pEnd) {
		Check(pStart < pEnd);
		var nNalUnitType = abStream[pStart++] & 31;
		if (nNalUnitType === 14 || nNalUnitType === 20 || nNalUnitType === 21) {
			Check(pStart < pEnd);
			pStart += nNalUnitType === 21 && (abStream[pStart] & 128) != 0 ? 2 : 3;
			Check(pStart <= pEnd);
		}
		var pRbspStart = pStart;
		var pEnd2 = pEnd - 2;
		while (pStart < pEnd2) {
			if (abStream[pStart++] === 0 && abStream[pStart++] === 0) {
				var nThirdByte = abStream[pStart++];
				Check(nThirdByte >= 3);
				if (nThirdByte === 3) {
					var pDecodedStream = pStart - 1;
					Check(pStart === pEnd || abStream[pStart] <= 3);
					while (pStart < pEnd2) {
						if ((abStream[pDecodedStream++] = abStream[pStart++]) === 0 && (abStream[pDecodedStream++] = abStream[pStart++]) === 0) {
							nThirdByte = abStream[pDecodedStream++] = abStream[pStart++];
							Check(nThirdByte >= 3);
							if (nThirdByte === 3) {
								--pDecodedStream;
								Check(pStart === pEnd || abStream[pStart] <= 3);
							}
						}
					}
					while (pStart !== pEnd) {
						var nLastByte = abStream[pDecodedStream++] = abStream[pStart++];
					}
					Check(nLastByte !== 0);
					return {
						pRbspStart,
						pRbspEnd: pDecodedStream
					};
				}
			}
		}
		Check(pStart === pEnd || abStream[pEnd - 1] !== 0);
		return {
			pRbspStart,
			pRbspEnd: pEnd
		};
	}
	function ParseAudioStream() {
		if (_trkAudio.IsEmpty()) {
			return true;
		}
		var ADTS_HEADER_SIZE = 7;
		Check(_trkAudio.pStreamEnd > _trkAudio.pStreamStart && _trkAudio.pSamplesEnd === _trkAudio.pSamplesStart);
		if (_bDiscontinuity) {
			Check(_trkAudio.GetStreamSize() > ADTS_HEADER_SIZE);
			ParseAdtsFixedHeader(_dvHeap.getUint32(_trkAudio.pStreamStart));
		}
		var pAdtsFrame = _trkAudio.pStreamStart;
		var pParsedStream = _trkAudio.pStreamStart;
		var pSample = _trkAudio.pSamplesStart;
		var pStreamEnd = _trkAudio.pStreamEnd - ADTS_HEADER_SIZE;
		var pSamplesMemoryEnd = _trkAudio.pSamplesMemoryEnd - AUDIO_SAMPLE_STRUCT_SIZE;
		while (pAdtsFrame < pStreamEnd) {
			Check(pSample <= pSamplesMemoryEnd);
			Check(_abHeap[pAdtsFrame] === 255 && _abHeap[pAdtsFrame + 1] === 241);
			Check((_abHeap[pAdtsFrame + 6] & 3) == 0);
			var cbAdtsFrame = _dvHeap.getUint32(pAdtsFrame + 3) >> 13 & 8191;
			var pNextAdtsFrame = pAdtsFrame + cbAdtsFrame;
			Check(cbAdtsFrame > ADTS_HEADER_SIZE && pNextAdtsFrame <= _trkAudio.pStreamEnd);
			_abHeap.copyWithin(pParsedStream, pAdtsFrame + ADTS_HEADER_SIZE, pNextAdtsFrame);
			cbAdtsFrame -= ADTS_HEADER_SIZE;
			pParsedStream += cbAdtsFrame;
			_dvHeap.setUint32(pSample, cbAdtsFrame);
			pSample += AUDIO_SAMPLE_STRUCT_SIZE;
			pAdtsFrame = pNextAdtsFrame;
		}
		Check(pAdtsFrame === _trkAudio.pStreamEnd);
		_trkAudio.pStreamEnd = pParsedStream;
		_trkAudio.pSamplesEnd = pSample;
		var nAudioSampleDuration = AUDIO_SAMPLE_LENGTH / _nSamplingFrequency;
		var nAudioSegmentDuration = _trkAudio.GetNumberOfSamples() * nAudioSampleDuration;
		_nDtsAudioSegmentEnd = _trkAudio.nDtsStart + Math.round(nAudioSegmentDuration * TS_TIMESCALE);
		_nAudioBitrate = _trkAudio.GetStreamSize() * 8 / 1e3 / nAudioSegmentDuration;
		m_Log.Log(`DtsEndAudSegment=${(_nDtsAudioSegmentEnd / TS_TIMESCALE).toFixed(5)}` + ` DurAudSegment=${(nAudioSegmentDuration * 1e3).toFixed(2)}ms` + ` DurAudSample=${(nAudioSampleDuration * 1e3).toFixed(2)}ms`);
		return true;
	}
	function ParseAdtsFixedHeader(nAdtsFixedHeader) {
		Check((nAdtsFixedHeader & 4294901760) == (4293984256 | 0));
		_nAudioObjectType = (nAdtsFixedHeader >> 14 & 3) + 1;
		Check(_nAudioObjectType === 2);
		_anDecoderSpecificInfo[0] = _nAudioObjectType << 3;
		var nSamplingFrequencyIndex = nAdtsFixedHeader >> 10 & 15;
		_nSamplingFrequency = SAMPLING_FREQUENCY[nSamplingFrequencyIndex];
		Check(_nSamplingFrequency !== void 0);
		_anDecoderSpecificInfo[0] |= nSamplingFrequencyIndex >> 1;
		_anDecoderSpecificInfo[1] = nSamplingFrequencyIndex << 7 & 128;
		_nChannelCount = nAdtsFixedHeader >> 6 & 7;
		Check(_nChannelCount !== 0);
		_anDecoderSpecificInfo[1] |= _nChannelCount << 3;
		m_Log[_nAudioObjectType !== 2 || _nSamplingFrequency < 44100 || _nChannelCount > 2 ? 'LogError' : 'Log'](`AudioObjectType=${_nAudioObjectType} SamplingFrequency=${_nSamplingFrequency} ChannelCount=${_nChannelCount}`);
	}
	function GetCodecName() {
		var s = 'video/mp4;codecs="';
		if (!_trkVideo.IsEmpty()) {
			s += `avc1.${`0${_nProfileIndication.toString(16)}`.slice(-2).toUpperCase()}${`0${_nConstraintSetFlag.toString(16)}`.slice(-2).toUpperCase()}${`0${_nLevelIndication.toString(16)}`.slice(-2).toUpperCase()}`;
		}
		if (!_trkVideo.IsEmpty() && !_trkAudio.IsEmpty()) {
			s += ',';
		}
		if (!_trkAudio.IsEmpty()) {
			s += `mp4a.40.${_nAudioObjectType}`;
		}
		return s + '"';
	}
	function CreateInitializationSegment() {
		var cbSize = 1100 + (_abSequenceParameterSet === null ? 0 : _abSequenceParameterSet.length) + (_abPictureParameterSet === null ? 0 : _abPictureParameterSet.length) + (_abSequenceParameterSetExt === null ? 0 : _abSequenceParameterSetExt.length) + (_trkAudio.IsEmpty() ? 0 : _anDecoderSpecificInfo.length);
		var abSegment = new Uint8Array(cbSize);
		var dvSegment = CreateDataView(abSegment);
		var oSegment = new IsoBaseMedia(abSegment, dvSegment, 0);
		oSegment.AddBox('ftyp', [ 105, 115, 111, 54, 0, 0, 0, 0, 97, 118, 99, 49 ]);
		oSegment.AddBox('moov', () => {
			oSegment.AddFullBox('mvhd', 1, 0, [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255 ]);
			oSegment.AddBox('mvex', () => {
				if (!_trkVideo.IsEmpty()) {
					oSegment.AddFullBox('trex', 0, 0, 20);
					oSegment.dvBuffer.setUint32(oSegment.pEnd - 20, VIDEO_TRACK_NUMBER);
					oSegment.dvBuffer.setUint32(oSegment.pEnd - 16, 1);
				}
				if (!_trkAudio.IsEmpty()) {
					oSegment.AddFullBox('trex', 0, 0, 20);
					oSegment.dvBuffer.setUint32(oSegment.pEnd - 20, AUDIO_TRACK_NUMBER);
					oSegment.dvBuffer.setUint32(oSegment.pEnd - 16, 1);
					oSegment.dvBuffer.setUint32(oSegment.pEnd - 12, AUDIO_SAMPLE_LENGTH);
				}
			});
			if (!_trkVideo.IsEmpty()) {
				AddTrackToInitializationSegment(true, oSegment);
			}
			if (!_trkAudio.IsEmpty()) {
				AddTrackToInitializationSegment(false, oSegment);
			}
		});
		return oSegment.Finish();
	}
	function AddTrackToInitializationSegment(bVideo, oSegment) {
		oSegment.AddBox('trak', () => {
			oSegment.AddFullBox('tkhd', 0, 3, 80);
			oSegment.abBuffer[oSegment.pEnd - 64] = 255;
			oSegment.abBuffer[oSegment.pEnd - 63] = 255;
			oSegment.abBuffer[oSegment.pEnd - 62] = 255;
			oSegment.abBuffer[oSegment.pEnd - 61] = 255;
			oSegment.abBuffer[oSegment.pEnd - 43] = 1;
			oSegment.abBuffer[oSegment.pEnd - 27] = 1;
			oSegment.abBuffer[oSegment.pEnd - 12] = 64;
			if (bVideo) {
				oSegment.dvBuffer.setUint32(oSegment.pEnd - 72, VIDEO_TRACK_NUMBER);
				oSegment.dvBuffer.setUint16(oSegment.pEnd - 8, _nImageWidth);
				oSegment.dvBuffer.setUint16(oSegment.pEnd - 4, _nImageHeight);
			} else {
				oSegment.dvBuffer.setUint32(oSegment.pEnd - 72, AUDIO_TRACK_NUMBER);
				oSegment.dvBuffer.setUint16(oSegment.pEnd - 48, 256);
			}
			oSegment.AddBox('mdia', () => {
				oSegment.AddFullBox('mdhd', 0, 0, 20);
				oSegment.dvBuffer.setUint32(oSegment.pEnd - 12, bVideo ? TS_TIMESCALE : _nSamplingFrequency);
				oSegment.abBuffer[oSegment.pEnd - 8] = 255;
				oSegment.abBuffer[oSegment.pEnd - 7] = 255;
				oSegment.abBuffer[oSegment.pEnd - 6] = 255;
				oSegment.abBuffer[oSegment.pEnd - 5] = 255;
				oSegment.abBuffer[oSegment.pEnd - 4] = 85;
				oSegment.abBuffer[oSegment.pEnd - 3] = 196;
				oSegment.AddFullBox('hdlr', 0, 0, 21);
				if (bVideo) {
					oSegment.abBuffer[oSegment.pEnd - 17] = 118;
					oSegment.abBuffer[oSegment.pEnd - 16] = 105;
					oSegment.abBuffer[oSegment.pEnd - 15] = 100;
					oSegment.abBuffer[oSegment.pEnd - 14] = 101;
				} else {
					oSegment.abBuffer[oSegment.pEnd - 17] = 115;
					oSegment.abBuffer[oSegment.pEnd - 16] = 111;
					oSegment.abBuffer[oSegment.pEnd - 15] = 117;
					oSegment.abBuffer[oSegment.pEnd - 14] = 110;
				}
				oSegment.AddBox('minf', () => {
					if (bVideo) {
						oSegment.AddFullBox('vmhd', 0, 1, 8);
					} else {
						oSegment.AddFullBox('smhd', 0, 0, 4);
					}
					oSegment.AddBox('dinf', () => {
						oSegment.AddFullBox('dref', 0, 0, () => {
							oSegment.dvBuffer.setUint32(oSegment.pEnd, 1);
							oSegment.pEnd += 4;
							oSegment.AddFullBox('url ', 0, 1, 0);
						});
					});
					oSegment.AddBox('stbl', () => {
						oSegment.AddFullBox('stsd', 0, 0, () => {
							oSegment.dvBuffer.setUint32(oSegment.pEnd, 1);
							oSegment.pEnd += 4;
							if (bVideo) {
								oSegment.AddBox('avc1', () => {
									oSegment.dvBuffer.setUint16(oSegment.pEnd + 6, 1);
									oSegment.dvBuffer.setUint16(oSegment.pEnd + 24, _nImageWidth);
									oSegment.dvBuffer.setUint16(oSegment.pEnd + 26, _nImageHeight);
									oSegment.dvBuffer.setUint32(oSegment.pEnd + 28, 4718592);
									oSegment.dvBuffer.setUint32(oSegment.pEnd + 32, 4718592);
									oSegment.dvBuffer.setUint16(oSegment.pEnd + 40, 1);
									oSegment.dvBuffer.setUint16(oSegment.pEnd + 74, 24);
									oSegment.dvBuffer.setUint16(oSegment.pEnd + 76, 65535);
									oSegment.pEnd += 78;
									oSegment.AddBox('avcC', () => {
										oSegment.abBuffer[oSegment.pEnd] = 1;
										oSegment.abBuffer[oSegment.pEnd + 1] = _nProfileIndication;
										oSegment.abBuffer[oSegment.pEnd + 2] = _nConstraintSetFlag;
										oSegment.abBuffer[oSegment.pEnd + 3] = _nLevelIndication;
										oSegment.abBuffer[oSegment.pEnd + 4] = 255;
										oSegment.abBuffer[oSegment.pEnd + 5] = 225;
										oSegment.dvBuffer.setUint16(oSegment.pEnd + 6, _abSequenceParameterSet.length);
										oSegment.CopyFromBuffer(oSegment.pEnd + 8, _abSequenceParameterSet);
										oSegment.abBuffer[oSegment.pEnd] = 1;
										oSegment.dvBuffer.setUint16(oSegment.pEnd + 1, _abPictureParameterSet.length);
										oSegment.CopyFromBuffer(oSegment.pEnd + 3, _abPictureParameterSet);
										switch (_nProfileIndication) {
										  case 100:
										  case 110:
										  case 122:
										  case 144:
											oSegment.abBuffer[oSegment.pEnd] = 252 | _nChromaFormatIndication;
											oSegment.abBuffer[oSegment.pEnd + 1] = 248 | _nBitDepthLumaMinus8;
											oSegment.abBuffer[oSegment.pEnd + 2] = 248 | _nBitDepthChromaMinus8;
											if (_abSequenceParameterSetExt === null) {
												oSegment.pEnd += 4;
											} else {
												oSegment.abBuffer[oSegment.pEnd + 3] = 1;
												oSegment.dvBuffer.setUint16(oSegment.pEnd + 4, _abSequenceParameterSetExt.length);
												oSegment.CopyFromBuffer(oSegment.pEnd + 6, _abSequenceParameterSetExt);
											}
										}
									});
								});
							} else {
								oSegment.AddBox('mp4a', () => {
									oSegment.dvBuffer.setUint16(oSegment.pEnd + 6, 1);
									oSegment.dvBuffer.setUint16(oSegment.pEnd + 16, _nChannelCount === 1 ? 1 : 2);
									oSegment.dvBuffer.setUint16(oSegment.pEnd + 18, 16);
									oSegment.dvBuffer.setUint32(oSegment.pEnd + 24, _nSamplingFrequency << 16);
									oSegment.pEnd += 28;
									oSegment.AddFullBox('esds', 0, 0, () => {
										oSegment.abBuffer[oSegment.pEnd] = 3;
										oSegment.abBuffer[oSegment.pEnd + 1] = 23 + _anDecoderSpecificInfo.length;
										oSegment.dvBuffer.setUint16(oSegment.pEnd + 2, 1);
										oSegment.abBuffer[oSegment.pEnd + 5] = 4;
										oSegment.abBuffer[oSegment.pEnd + 6] = 15 + _anDecoderSpecificInfo.length;
										oSegment.abBuffer[oSegment.pEnd + 7] = 64;
										oSegment.abBuffer[oSegment.pEnd + 8] = 21;
										oSegment.abBuffer[oSegment.pEnd + 20] = 5;
										oSegment.abBuffer[oSegment.pEnd + 21] = _anDecoderSpecificInfo.length;
										oSegment.CopyFromArray(oSegment.pEnd + 22, _anDecoderSpecificInfo);
										oSegment.abBuffer[oSegment.pEnd] = 6;
										oSegment.abBuffer[oSegment.pEnd + 1] = 1;
										oSegment.abBuffer[oSegment.pEnd + 2] = 2;
										oSegment.pEnd += 3;
									});
								});
							}
						});
						oSegment.AddFullBox('stts', 0, 0, 4);
						oSegment.AddFullBox('stsc', 0, 0, 4);
						oSegment.AddFullBox('stco', 0, 0, 4);
						oSegment.AddFullBox('stsz', 0, 0, 8);
					});
				});
			});
		});
	}
	function CreateMediaSegment(abMediaSegment) {
		var dvMediaSegment = CreateDataView(abMediaSegment);
		var oSegment = new IsoBaseMedia(abMediaSegment, dvMediaSegment, 0);
		var pVideoDataOffset, pAudioDataOffset;
		oSegment.AddBox('moof', () => {
			oSegment.AddFullBox('mfhd', 0, 0, 4);
			dvMediaSegment.setUint32(oSegment.pEnd - 4, 0);
			if (!_trkVideo.IsEmpty()) {
				oSegment.AddBox('traf', () => {
					oSegment.AddFullBox('tfhd', 0, 131072, 4);
					dvMediaSegment.setUint32(oSegment.pEnd - 4, VIDEO_TRACK_NUMBER);
					oSegment.AddFullBox('tfdt', 1, 0, 8);
					abMediaSegment.setUint64(oSegment.pEnd - 8, _trkVideo.nDtsStart);
					oSegment.AddFullBox('trun', 1, 3841, () => {
						dvMediaSegment.setUint32(oSegment.pEnd, _trkVideo.GetNumberOfSamples());
						pVideoDataOffset = oSegment.pEnd + 4;
						oSegment.CopyFromBuffer(oSegment.pEnd + 8, _abHeap, _trkVideo.pSamplesStart, _trkVideo.pSamplesEnd);
					});
				});
			}
			if (!_trkAudio.IsEmpty()) {
				oSegment.AddBox('traf', () => {
					oSegment.AddFullBox('tfhd', 0, 131072, 4);
					dvMediaSegment.setUint32(oSegment.pEnd - 4, AUDIO_TRACK_NUMBER);
					oSegment.AddFullBox('tfdt', 1, 0, 8);
					abMediaSegment.setUint64(oSegment.pEnd - 8, Math.round(_trkAudio.nDtsStart / TS_TIMESCALE * _nSamplingFrequency));
					oSegment.AddFullBox('trun', 1, 513, () => {
						dvMediaSegment.setUint32(oSegment.pEnd, _trkAudio.GetNumberOfSamples());
						pAudioDataOffset = oSegment.pEnd + 4;
						oSegment.CopyFromBuffer(oSegment.pEnd + 8, _abHeap, _trkAudio.pSamplesStart, _trkAudio.pSamplesEnd);
					});
				});
			}
		});
		oSegment.AddBox('mdat', () => {
			if (!_trkVideo.IsEmpty()) {
				dvMediaSegment.setInt32(pVideoDataOffset, oSegment.pEnd - oSegment.pStart);
				oSegment.CopyFromBuffer(oSegment.pEnd, _abHeap, _trkVideo.pStreamStart, _trkVideo.pStreamEnd);
			}
			if (!_trkAudio.IsEmpty()) {
				dvMediaSegment.setInt32(pAudioDataOffset, oSegment.pEnd - oSegment.pStart);
				oSegment.CopyFromBuffer(oSegment.pEnd, _abHeap, _trkAudio.pStreamStart, _trkAudio.pStreamEnd);
			}
		});
		return oSegment.Finish();
	}
	function SendConvertedSegment(abMediaSegment) {
		var abufTransfer = void 0;
		var oData = {
			nConvertedIn: _nConvertedIn,
			bRejected: _bRejected,
			bVideoLoss: _bVideoLoss,
			bAudioLoss: _bAudioLoss,
			nMinVideoSampleDuration: _nMinVideoSampleDuration / TS_TIMESCALE * 1e3,
			nMaxVideoSampleDuration: _nMaxVideoSampleDuration / TS_TIMESCALE * 1e3,
			nAvgVideoSampleDuration: _nAvgVideoSampleDuration / TS_TIMESCALE * 1e3,
			nAudioBitrate: _nAudioBitrate,
			nEncodingPosition: _nEncodingPosition,
			nBroadcastPosition: _nBroadcastPosition,
			nEncodingTime: _nEncodingTime
		};
		if (abMediaSegment) {
			oData.abMediaSegment = CreateMediaSegment(abMediaSegment);
			oData.bHasVideo = !_trkVideo.IsEmpty();
			oData.bHasAudio = !_trkAudio.IsEmpty();
			abufTransfer = [ oData.abMediaSegment.buffer ];
			if (_bDiscontinuity) {
				oData.abInitializationSegment = CreateInitializationSegment();
				oData.sCodecs = GetCodecName();
				oData.nProfileIndication = _nProfileIndication;
				oData.nConstraintSetFlag = _nConstraintSetFlag;
				oData.nLevelIndication = _nLevelIndication;
				oData.nMaxNumberReferenceFrames = _nMaxNumberReferenceFrames;
				oData.nImageWidth = _nImageWidth;
				oData.nImageHeight = _nImageHeight;
				oData.nFrameRate = _nFrameRate;
				oData.nRange = _nRange;
				oData.bInterlaced = _bInterlaced;
				oData.nAudioObjectType = _nAudioObjectType;
				oData.nSamplingFrequency = _nSamplingFrequency;
				oData.nChannelCount = _nChannelCount;
				abufTransfer.push(oData.abInitializationSegment.buffer);
			}
			_oSourceSegment.bDiscontinuity = _bDiscontinuity;
			m_Log.Log(`Sending segment Discontinuity=${_bDiscontinuity} Size=${(oData.abMediaSegment.length / 1024 / 1024).toFixed(2)}MB`);
		}
		_oSourceSegment.pData = oData;
		m_Log.Send();
		SendResult(abufTransfer);
	}
	function JoinSegments() {
		if (_bDiscontinuity) {
			return;
		}
		var nDtsVideoDeviation = 0, nDtsVideoOverlap = 1, nDtsAudioDeviation = 0;
		if (!_trkVideo.IsEmpty()) {
			nDtsVideoDeviation = _trkVideo.nDtsStart - _nDtsPreviousVideoSegmentEnd;
			nDtsVideoOverlap = _trkVideo.nDtsStart - _nDtsLastVideoSamplePreviousVideoSegment;
		}
		if (!_trkAudio.IsEmpty()) {
			nDtsAudioDeviation = _trkAudio.nDtsStart - _nDtsPreviousAudioSegmentEnd;
		}
		if (nDtsVideoOverlap <= 0 || nDtsAudioDeviation < -TS_TIMESCALE * .1) {
			m_Log.LogError(`Added discontinuity: DtsVideoDeviation=${Ms(nDtsVideoDeviation)} DtsVideoOverlap=${Ms(nDtsVideoOverlap)} DtsAudioDeviation=${nDtsAudioDeviation}`);
			_bDiscontinuity = true;
			return;
		}
		if (Math.abs(nDtsVideoDeviation) > TS_TIMESCALE * .002 || Math.abs(nDtsAudioDeviation) > 2) {
			m_Log.LogError(`DtsVideoDeviation=${Ms(nDtsVideoDeviation)} DtsVideoOverlap=${Ms(nDtsVideoOverlap)} DtsAudioDeviation=${nDtsAudioDeviation}`);
		}
		if (nDtsVideoDeviation > TS_TIMESCALE * .01) {
			_bVideoLoss = true;
		}
		if (nDtsAudioDeviation > TS_TIMESCALE * .1) {
			_bAudioLoss = true;
		}
	}
	function CalculateLastVideoSampleDuration() {
		var nVideoSamples = _trkVideo.GetNumberOfSamples();
		if (nVideoSamples === 0) {
			return;
		}
		var nDuration;
		if (nVideoSamples === 1) {
			nDuration = _trkAudio.IsEmpty() ? Math.round(TS_TIMESCALE / 30) : _nDtsAudioSegmentEnd - _trkAudio.nDtsStart;
		} else {
			nDuration = _dvHeap.getUint32(_trkVideo.pSamplesEnd - VIDEO_SAMPLE_STRUCT_SIZE * 2 + VIDEO_SAMPLE_DURATION);
			var pSample = _trkVideo.pSamplesEnd - VIDEO_SAMPLE_STRUCT_SIZE;
			var nDts = 0;
			var nVpLastVideoSample = _dvHeap.getInt32(pSample + VIDEO_SAMPLE_VP);
			for (var i = Math.min(16, nVideoSamples); --i != 0; ) {
				pSample -= VIDEO_SAMPLE_STRUCT_SIZE;
				nDts -= _dvHeap.getUint32(pSample + VIDEO_SAMPLE_DURATION);
				var nVp = nDts + _dvHeap.getInt32(pSample + VIDEO_SAMPLE_VP);
				if (nVp > nVpLastVideoSample) {
					nDuration = Math.min(nDuration, nVp - nVpLastVideoSample);
				}
			}
		}
		m_Log[nVideoSamples === 1 ? 'LogError' : 'Log'](`Duration of the last video sample ${Ms(nDuration)}`);
		_dvHeap.setUint32(_trkVideo.pSamplesEnd - VIDEO_SAMPLE_STRUCT_SIZE + VIDEO_SAMPLE_DURATION, nDuration);
		_nDtsVideoSegmentEnd = _nDtsLastVideoSample + nDuration;
	}
	function ConvertSegment() {
		var nStart = performance.now();
		_bDiscontinuity = _bDiscontinuity || _oSourceSegment.bDiscontinuity;
		m_Log.Log(`CONVERTING SEGMENT ${_oSourceSegment.nNumber} Discontinuity=${_bDiscontinuity} Duration=${_oSourceSegment.nDuration} Size=${(_oSourceSegment.pData.byteLength / 1024 / 1024).toFixed(2)}MB`);
		ClearStatistics();
		var bSegmentConverted = false;
		var abTransportStream = new Uint8Array(_oSourceSegment.pData);
		try {
			m_Memory.Allocate(abTransportStream);
			if (ParseTransportStream(abTransportStream)) {
				JoinSegments();
				ParseMetadata();
				bSegmentConverted = ParseVideoStream() && ParseAudioStream();
				if (bSegmentConverted) {
					CalculateLastVideoSampleDuration();
				}
			}
		} catch (pException) {
			if (pException instanceof Error && pException.message === 'REJECT') {
				m_Log.LogError(`Segment rejected: ${pException.stack}`);
				ClearStatistics();
				_bRejected = true;
			} else {
				throw pException;
			}
		}
		_oSourceSegment.pData = null;
		if (bSegmentConverted) {
			SendConvertedSegment(abTransportStream);
		} else {
			ThrowInTheTrash(abTransportStream);
			SendConvertedSegment(null);
		}
		_bDiscontinuity = !bSegmentConverted;
		_nDtsLastVideoSamplePreviousVideoSegment = _nDtsLastVideoSample;
		_nDtsPreviousVideoSegmentEnd = _nDtsVideoSegmentEnd;
		_nDtsPreviousAudioSegmentEnd = _nDtsAudioSegmentEnd;
		_nConvertedIn = performance.now() - nStart;
	}
	function HandleStateChange() {
		m_Log.Log(`SKIPPING SEGMENT ${_oSourceSegment.nNumber} State=${_oSourceSegment.pData}`);
		if (_oSourceSegment.pData !== STATE_CHANGE_VARIANT) {
			m_Memory.Free();
		}
		m_Log.Send();
		SendResult();
		_bDiscontinuity = true;
	}
	function HandleMessage(pData) {
		_oSourceSegment = pData;
		if (typeof _oSourceSegment.pData == 'number') {
			HandleStateChange();
		} else {
			ConvertSegment();
		}
		_oSourceSegment = null;
	}
	function HandleException(pException) {
		self.onmessage = null;
		_aUnprocessedMessages = null;
		m_Memory.Free();
		m_Log.Send();
		TerminateAndSendReport(pException);
	}
	self.onmessage = (oEvent => {
		try {
			if (_aUnprocessedMessages !== null) {
				_aUnprocessedMessages.push(oEvent.data);
				m_Log.LogError('Message processing delayed: compilation not finished');
				m_Log.Send();
			} else {
				HandleMessage(oEvent.data);
			}
		} catch (pException) {
			HandleException(pException);
		}
	});
	self.onmessageerror = (oEvent => {
		throw new Error(`Event ${oEvent.type} occurred`);
	});
	_oAssembler.Compile().then(() => {
		m_Log.Log(`Compilation finished: ${performance.now().toFixed()}ms Unprocessed messages: ${_aUnprocessedMessages.length}`);
		while (_aUnprocessedMessages.length !== 0) {
			HandleMessage(_aUnprocessedMessages.shift());
		}
		_aUnprocessedMessages = null;
	}).catch(HandleException);
}