import Actions from '../actions'

import Slider from './slider'

import { formatRgb, rgbToPercentage } from '../util/color'

import { Rgb, Red, Green, Blue, Hsv } from '../types/color'

import ColorBox from './color-box'

interface Props {
	color: Rgb
	hsv: Hsv
}

export default ({ props, dispatch }) => {
	const { color, hsv } = props as Props

	const rgbString = formatRgb(color)

	const colorText = rgbToPercentage(color).map(n => `${ n }%`).join(',') + `(${ rgbString })`

	const onInputRed = ({ target }) => {
		dispatch(Actions.Stain.SetColor([target.value, color[Green], color[Blue]]))
	}

	const onInputGreen = ({ target }) => {
		dispatch(Actions.Stain.SetColor([color[Red], target.value, color[Blue]]))
	}

	const onInputBlue = ({ target }) => {
		dispatch(Actions.Stain.SetColor([color[Red], color[Green], target.value]))
	}

	const onInputHue = ({ target }) => {
		dispatch(Actions.Stain.SetHsv([target.value, hsv[1], hsv[2]]))
	}

	const onInputSaturation = ({ target }) => {
		dispatch(Actions.Stain.SetHsv([hsv[0], target.value, hsv[2]]))
	}

	const onInputValue = ({ target }) => {
		dispatch(Actions.Stain.SetHsv([hsv[0], hsv[1], target.value]))
	}
	return (
		<ColorBox class="color-preview" color={ color }>
			<span class="color-text">{ colorText }</span>
			<div class="color-sliders">
				<div class="slider-group">
					<p class="slider-row">
						<span class="color-tag">R</span>
						<Slider value={ color[Red] } max={ 255 } onInput={ onInputRed } />
						<span class="color-value">{ color[Red] }</span>
					</p>
					<p class="slider-row">
						<span class="color-tag">G</span>
						<Slider value={ color[Green] } max={ 255 } onInput={ onInputGreen } />
						<span class="color-value">{ color[Green] }</span>
					</p>
					<p class="slider-row">
						<span class="color-tag">B</span>
						<Slider value={ color[Blue] } max={ 255 } onInput={ onInputBlue } />
						<span class="color-value">{ color[Blue] }</span>
					</p>
				</div>
				<div class="slider-group">
					<p class="slider-row">
						<span class="color-tag">H</span>
						<Slider value={ hsv[0] } max={ 360 } onInput={ onInputHue } />
						<span class="color-value">{ hsv[0] }</span>
					</p>
					<p class="slider-row">
						<span class="color-tag">S</span>
						<Slider value={ hsv[1] } max={ 100 } onInput={ onInputSaturation } />
						<span class="color-value">{ hsv[1] }</span>
					</p>
					<p class="slider-row">
						<span class="color-tag">V</span>
						<Slider value={ hsv[2] } max={ 100 } onInput={ onInputValue } />
						<span class="color-value">{ hsv[2] }</span>
					</p>
				</div>
			</div>
		</ColorBox>
	)
}
