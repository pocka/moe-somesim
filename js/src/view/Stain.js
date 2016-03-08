import {element} from 'deku';
import Preview from './ColorPreview';

import {select_color} from '../actions/';

let Stain= ({props})=>{
	let onclick=e=>{
		select_color(props.color);
		props.onClick
			&& props.onClick();
	};

	return (
		<p class="stain" onClick={onclick}>
			{props.name}
			<br/>
			<Preview color={props.color}></Preview>
		</p>
	);
}

export default Stain;
