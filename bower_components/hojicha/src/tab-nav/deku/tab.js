/**@jsx element*/
import {element} from 'deku';

let render=({props,children})=>{
	return (
		<div id={`hojicha--tab-nav--container--${props.name}`} class="hojicha--tab-nav--container">
			{children}
		</div>
	);
};

export default render;
