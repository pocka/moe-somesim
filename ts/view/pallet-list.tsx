import Actions from '../actions'

import Pallet from '../types/pallet'
import { Rgb } from '../types/color'

import PalletItem from './pallet-item'
import IconButton from './icon-button'

interface Props {
	pallets: Pallet[]
	color: Rgb
}

export default ({ props, dispatch }) => {
	const { pallets, color } = props as Props

	const addPallet = () => dispatch(Actions.Pallets.Add(color))

	return (
		<ul class="pallet-list">
			<li class="pallet-list-header">
				<IconButton icon="plus" onClick={ addPallet } title="パレットを追加" />
			</li>
			{
				pallets.map(pallet => {
					return <PalletItem pallet={ pallet } color={ color } />
				})
			}
		</ul>
	)
}
