/**@jsx element*/
import {element} from 'deku';

let render=({props,children})=>{
	return (
		<div id={`hojicha--tab--container--${props.name}`} class="hojicha--tab--container">
			{children}
		</div>
	);
};

export default render;
