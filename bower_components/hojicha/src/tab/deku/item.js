/** @jsx element */
import {element} from 'deku';

let render=({props,children})=>{
	let checkbox_id='hojicha--tab--item--radio--'+props.name;
	return (
		<div class="hojicha--tab--item">
			<input name={props.group} type="radio" checked={props.default} class="hojicha--tab--item--radio" id={checkbox_id}/>
			<label class="hojicha--tab--item--label" for={checkbox_id}>{props.title}</label>
			<div class="hojicha--tab--item--panel">
				<div class="hojicha--tab--item--contents">
					{children}
				</div>
			</div>
		</div>
	);
};

export default render;
