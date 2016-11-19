import Actions from '../actions'

import { FlowerSlot } from '../types/flower'

import FlowerSlotComponent from './flower-slot'
import IconButton from './icon-button'

interface Props {
	slots: FlowerSlot[]
	bleach: number
}


export default ({ props, dispatch }) => {
	const { slots, bleach } = props as Props

	const onRepaint = ev => dispatch(Actions.Stain.RefreshColor())

	const onClearAll = ev => dispatch(Actions.Stain.ClearAllSlots())

	return (
		<div class="flower-slot-manager">
			<FlowerSlotComponent slotIndex={ 0 } slotData={ slots[0] } />
			<FlowerSlotComponent slotIndex={ 1 } slotData={ slots[1] } />
			<FlowerSlotComponent slotIndex={ 2 } slotData={ slots[2] } />
			<FlowerSlotComponent slotIndex={ 3 } slotData={ slots[3] } />
			<IconButton icon="cross" onClick={ onClearAll } title="全てクリア" />
			<IconButton icon="paint-format" onClick={ onRepaint } title="染めなおす" />
		</div>
	)
}
