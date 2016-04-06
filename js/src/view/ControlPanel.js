import {element} from 'deku';

// prop list
// ________________________________
// | name		| type	| nessesary
// |------------|-------|----------
// | visible	| Color	| false
// --------------------------------
//
export default ({props,children})=>{
	return (
		<div class={ `control-panel ${ !props.visible ? `control-panel--hidden` : `` }` }>
			{children}
		</div>
	);
};
