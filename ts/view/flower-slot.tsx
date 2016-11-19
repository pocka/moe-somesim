import Actions from '../actions'

import { FlowerSlot } from '../types/flower'

import { formatRgb } from '../util/color'


interface Props {
	slotIndex: number
	slotData: FlowerSlot
}

export default ({ props, dispatch }) => {
	const { slotIndex, slotData } = props as Props

	// To enable dropping, we must skip dragover events.
	const onDragOver = ev => {
		ev.preventDefault()
	}

	const onDrop = ev => {
		ev.preventDefault()

		const flower = JSON.parse(ev.dataTransfer.getData('text'))

		dispatch(Actions.Stain.SetSlot(slotIndex, flower))
	}

	const isEmpty = !slotData

	const className = !isEmpty ? 'flower-slot icon' : 'flower-slot-empty'

	const style = !isEmpty ? `background-color:rgb(${ formatRgb(slotData.rgb) });` : ''

	const title = !isEmpty
		? `${ slotData.name } (${ slotData.color.map(s => `${ s }%`).join(',') })\n(クリックでスロットから取り除く)`
		: `スロット${ slotIndex + 1 }は空です`

	const onClick = ev => {
		dispatch(Actions.Stain.ClearSlot(slotIndex))
	}

	return (
		<a class={ className } style={ style } title={ title } onDragOver={ onDragOver } onDrop={ onDrop } onClick={ onClick } x-slot-touch-dnd={ slotIndex }></a>
	)
}
