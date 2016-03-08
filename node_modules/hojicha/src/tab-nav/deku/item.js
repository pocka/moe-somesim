/** @jsx element */
import {element} from 'deku';

let render=({props,children})=>{
	let checkbox_id='hojicha--tab-nav--item--radio--'+props.name;
	return (
		<div class="hojicha--tab-nav--item">
			<input name={props.group} type="radio" checked={props.default} class="hojicha--tab-nav--item--radio" id={checkbox_id} onClick={props.onClick}/>
			<label class="hojicha--tab-nav--item--label" for={checkbox_id}>{children}</label>
		</div>
	);
};

export default render;
