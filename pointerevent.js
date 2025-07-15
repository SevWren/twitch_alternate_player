(() => {
	'use strict';
	/**
	 * @fileoverview This file is a polyfill for the PointerEvent API. It creates PointerEvents from MouseEvents.
	 * This is necessary for browsers that do not support PointerEvents natively.
	 */
	const _oProperties = {
		pointerId: 0,
		width: 1,
		height: 1,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: '',
		isPrimary: false
	};
	class PointerEvent extends MouseEvent {
		constructor(sEventType, oParameters = {}) {
			super(sEventType, oParameters);
			const oPropertyDefinition = {
				enumerable: true,
				configurable: true
			};
			for (const sName of Object.keys(_oProperties)) {
				if (sName in oParameters) {
					if (typeof oParameters[sName] != typeof _oProperties[sName] || Number.isNaN(oParameters[sName])) {
						throw new TypeError(`Invalid type for parameter ${sName} passed to PointerEvent constructor`);
					}
					oPropertyDefinition.value = oParameters[sName];
				} else {
					oPropertyDefinition.value = _oProperties[sName];
				}
				Object.defineProperty(this, sName, oPropertyDefinition);
			}
		}
	}
	let _bDelayMouseMessages = false;
	/**
	 * Creates and dispatches a PointerEvent for a MouseEvent.
	 * @param {MouseEvent} oMouseEvent The original MouseEvent.
	 * @param {string} sEventType The type of the PointerEvent to create.
	 * @param {number} button The button property for the PointerEvent.
	 * @returns {boolean} Whether the event was canceled.
	 * @translation СоздатьИПослатьСобытиеУказателяДляМыши
	 */
	function createAndDispatchPointerEventForMouse(oMouseEvent, sEventType, button) {
		const oParameters = {};
		oParameters.bubbles = oMouseEvent.bubbles;
		oParameters.cancelable = oMouseEvent.cancelable;
		oParameters.composed = true;
		oParameters.view = oMouseEvent.view;
		oParameters.ctrlKey = oMouseEvent.ctrlKey;
		oParameters.shiftKey = oMouseEvent.shiftKey;
		oParameters.altKey = oMouseEvent.altKey;
		oParameters.metaKey = oMouseEvent.metaKey;
		oParameters.modifierAltGraph = oMouseEvent.getModifierState('AltGraph');
		oParameters.modifierCapsLock = oMouseEvent.getModifierState('CapsLock');
		oParameters.modifierNumLock = oMouseEvent.getModifierState('NumLock');
		oParameters.modifierScrollLock = oMouseEvent.getModifierState('ScrollLock');
		oParameters.screenX = oMouseEvent.screenX;
		oParameters.screenY = oMouseEvent.screenY;
		oParameters.clientX = oMouseEvent.clientX;
		oParameters.clientY = oMouseEvent.clientY;
		oParameters.button = button;
		oParameters.buttons = oMouseEvent.buttons;
		oParameters.relatedTarget = oMouseEvent.relatedTarget;
		oParameters.pressure = oParameters.buttons === 0 ? 0 : .5;
		oParameters.pointerType = 'mouse';
		oParameters.isPrimary = true;
		const oPointerEvent = new PointerEvent(sEventType, oParameters);
		Object.defineProperty(oPointerEvent, 'timeStamp', {
			enumerable: true,
			configurable: true,
			value: oMouseEvent.timeStamp
		});
		const bCanceled = !oMouseEvent.target.dispatchEvent(oPointerEvent);
		if (bCanceled) {
			oMouseEvent.preventDefault();
		}
		return bCanceled;
	}
	const handleMouseDown = AddExceptionHandler(oMouseEvent => {
		if ((oMouseEvent.buttons & oMouseEvent.buttons - 1) == 0) {
			_bDelayMouseMessages = createAndDispatchPointerEventForMouse(oMouseEvent, 'pointerdown', oMouseEvent.button);
		} else {
			createAndDispatchPointerEventForMouse(oMouseEvent, 'pointermove', oMouseEvent.button);
		}
		if (_bDelayMouseMessages) {
			oMouseEvent.stopImmediatePropagation();
		}
	});
	const handleMouseMove = AddExceptionHandler(oMouseEvent => {
		createAndDispatchPointerEventForMouse(oMouseEvent, 'pointermove', -1);
		if (_bDelayMouseMessages) {
			oMouseEvent.stopImmediatePropagation();
		}
	});
	const handleMouseUp = AddExceptionHandler(oMouseEvent => {
		if (oMouseEvent.buttons === 0) {
			createAndDispatchPointerEventForMouse(oMouseEvent, 'pointerup', oMouseEvent.button);
		} else {
			createAndDispatchPointerEventForMouse(oMouseEvent, 'pointermove', oMouseEvent.button);
		}
		if (_bDelayMouseMessages) {
			oMouseEvent.stopImmediatePropagation();
		}
		if (oMouseEvent.buttons === 0) {
			_bDelayMouseMessages = false;
		}
	});
	const handleMouseOver = AddExceptionHandler(oMouseEvent => {
		createAndDispatchPointerEventForMouse(oMouseEvent, 'pointerover', -1);
	});
	const handleMouseOut = AddExceptionHandler(oMouseEvent => {
		createAndDispatchPointerEventForMouse(oMouseEvent, 'pointerout', -1);
	});
	Object.defineProperty(window, 'PointerEvent', {
		writable: true,
		configurable: true,
		value: PointerEvent
	});
	m_Log.LogError('[PointerEvent] Using mouse events');
	window.addEventListener('mousedown', handleMouseDown, true);
	window.addEventListener('mousemove', handleMouseMove, true);
	window.addEventListener('mouseup', handleMouseUp, true);
	window.addEventListener('mouseover', handleMouseOver, true);
	window.addEventListener('mouseout', handleMouseOut, true);
})();