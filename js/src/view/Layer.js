import {element} from 'deku';

// prop list
// ____________________________________
// | name		| type		| nessesary
// |------------|-----------|----------
// | name		| string	| true
// ------------------------------------
//
export let Layer=({props,dispatch,children})=>{
	let id=`somesim--layer--checkbox--${props.name}`;
	return (
		<div class="somesim--layer--container">
			<input type="checkbox" id={id} class="somesim--layer--checkbox"/>
			<label for={id} class="somesim--layer--layer">
			</label>
			<label class="somesim--layer--panel--close" for={ id }>X</label>
			<div class="somesim--layer--panel" onClick={(e)=>{e.stopPropagation();}}>
				{ children }
			</div>
		</div>
	);
}

// prop list
// ____________________________________
// | name		| type		| nessesary
// |------------|-----------|----------
// | name		| string	| true
// ------------------------------------
//
export let Controller=({props,dispatch,children})=>{
	let id=`somesim--layer--checkbox--${props.name}`;

	return (
		<label class="somesim--layer--controller--container" for={ id }>
			{ children }
		</label>
	);
}
