import {element} from 'deku';

import {Action} from '../actions';

// prop list
// ____________________________________
// | name		| type		| nessesary
// |------------|-----------|----------
// | color		| Color		| true
// | name		| any		| true
// | onChange	| function	| false
// ------------------------------------
//
export default ({props,dispatch,children})=>{
	let onclick=
		props.onChange
		? ()=>{
			props.onChange(props.color);
		}
		: ()=>{
			dispatch(Action.SelectColor(props.color));
		};
	return (
		<span class="color--color-tip--container" onClick={onclick}>
			<span class="color--color-tip" style={'background-color:#'+props.color.to_hex()+';'}></span>
			<span class="color--color-tip--tip">{props.name}</span>
		</span>
	);
};
