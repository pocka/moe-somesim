import Actions from '../actions'

import Pallet from '../types/pallet'
import { Rgb } from '../types/color'

import { formatRgb } from '../util/color'

import ColorBox from './color-box'
import IconButton from './icon-button'


interface Props {
	pallet: Pallet
	color: Rgb
}


export default ({ props, dispatch }) => {
	const { pallet, color } = props as Props

	const selectColor = () => {
		dispatch(Actions.Stain.SetColor(pallet.color))
	}
	const updateName = ({ target }) => {
		dispatch(Actions.Pallets.UpdateName(pallet, target.value))
	}
	const updateColor = () => {
		dispatch(Actions.Pallets.UpdateColor(pallet, color))
	}
	const removePallet = () => {
		dispatch(Actions.Pallets.Remove(pallet))
	}

	const selectAll = ev => ev.target.select()

	const colorValue = `rgb(${ formatRgb(pallet.color) })`

	return (
		<li class="pallet-item">
			<ColorBox color={ pallet.color } onClick={ selectColor } class="pallet-color">
				<input class="pallet-name" type="text" value={ pallet.name } onInput={ updateName } onFocus={ selectAll } />
				<p class="pallet-value">
					{ colorValue }
					<span class="pallet-buttons">
					<IconButton icon="upload" onClick={ selectColor } title="色を読み出し" />
					<IconButton icon="floppy-disk" onClick={ updateColor } title="色を上書き" />
					<IconButton icon="cross" onClick={ removePallet } title="パレットを削除" />
					</span>
				</p>
			</ColorBox>
		</li>
	)
}
