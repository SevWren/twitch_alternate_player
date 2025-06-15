;;
;; WebAssembly implementation for SearchStartCodePrefix() in asmjs.js
;;
(module
(import "i" "m" (memory 1))
(export "SearchStartCodePrefix" (func $SearchStartCodePrefix))
(func $SearchStartCodePrefix
	(param $pStream i32) (param $pStreamEnd i32) (result i32)
	(local $pTemp i32) (local $uByte i32)

	block $Return

	(br_if $Return (i32.gt_s
		(get_local $pStream)
		(tee_local $pTemp (i32.add (get_local $pStreamEnd) (i32.const -3)))))

	loop $LSearchStart

		(if (i32.gt_u
			(tee_local $uByte (i32.load8_u offset=2 (get_local $pStream)))
			(i32.const 1))
		(then
			;; Chrome 71 теряет скорость если эту проверку оформить по другому.
			(br_if $LSearchStart (i32.le_s
				(tee_local $pStream (i32.add (get_local $pStream) (i32.const 3)))
				(get_local $pTemp)))
			br $Return
		))
		(if (i32.load8_u offset=1 (get_local $pStream)) (then
			(br_if $LSearchStart (i32.le_s
				(tee_local $pStream (i32.add (get_local $pStream) (i32.const 2)))
				(get_local $pTemp)))
			br $Return
		))
		(if (i32.load8_u (get_local $pStream)) (then
			(br_if $LSearchStart (i32.le_s
				(tee_local $pStream (i32.add (get_local $pStream) (i32.const 1)))
				(get_local $pTemp)))
			br $Return
		))

	end

	(set_local $pTemp (get_local $pStream))
	;; Chrome 71 теряет скорость если прибавить 3.
	(set_local $pStream (i32.add (get_local $pStream) (i32.const 2)))

	(if (i32.eqz (get_local $uByte)) (then
		loop  $LSearchEnd
			(br_if $Return (i32.eq
				(tee_local $pStream (i32.add (get_local $pStream) (i32.const 1)))
				(get_local $pStreamEnd)))
			(br_if $LSearchEnd (i32.eqz (tee_local $uByte (i32.load8_u (get_local $pStream)))))
		end
	))

	(if (i32.ne (get_local $uByte) (i32.const 1)) (then
		(return (i32.const -2))
	))
 
	(i32.store (i32.const 0)
		(i32.add
			(i32.const 1)
			(i32.sub
				(get_local $pStream)
				(get_local $pTemp))))
	;; Firefox 64 теряет скорость если выполнить return $pTemp.
	;; https://bugzilla.mozilla.org/show_bug.cgi?id=1512148
	(set_local $pStreamEnd (get_local $pTemp))

	end $Return
	(return (get_local $pStreamEnd))
))
