/** @jsx element */
import {element} from 'deku';

// prop list
// ____________________________
// | name	| type	| nessesary
// |--------|-------|----------
// | color	| Color	| true
// ----------------------------
//
let render=({props})=>{
	return (
		<span class="color-preview--container">
			<span class="color-preview--preview" style={'background-color:#'+props.color.to_hex()}>
			</span>
			{' '}
			<span class="color-preview--value">
				{props.color.to_percentage()}
			</span>
		</span>
	);
};

export default {render};
