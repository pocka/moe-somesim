import { Rgb } from '../types/color'

import { formatRgb } from '../util/color'


interface Props {
	color: Rgb
	class?: string
	onClick?: (ev: Event) => void
}


export default ({ props, children }) => {
	const { color, class: $class, onClick } = props as Props

	return (
		<div class={ `color-box ${ $class }` }>
			<div class="color-box-color">
				<span class="color" style={ `background-color:rgb(${ formatRgb(color) });` } onClick={ onClick }></span>
			</div>
			<div class="color-box-contents">
				{ children }
			</div>
		</div>
	)
}
