import Actions from '../actions'

import { Flower, FlowerSlot } from '../types/flower'

import { formatRgb } from '../util/color'


const createUid = str => encodeURI(str).replace(/%/g, '$')


interface Props {
	flower: Flower
	slots: FlowerSlot[]
}


export default ({ props, dispatch }) => {
	const { flower, slots } = props as Props

	const shadowId = createUid(flower.name)

	const rgbValue = formatRgb(flower.rgb)

	const onDragStart = ev => {
		ev.dataTransfer.setData('text', JSON.stringify(flower))

		ev.dataTransfer.setDragImage(document.getElementById(shadowId), 0, 0)
	}

	// Touch D&D implementation
	const onTouchEnd = ev => {
		document.body.removeChild(document.getElementById(`shadowing-${ shadowId }`))

		const { clientX: x, clientY: y } = ev.changedTouches[0]

		const dest = document.elementFromPoint(x, y)

		if (dest){
			const slotIndex = parseInt(dest.getAttribute('x-slot-touch-dnd'))

			if (!isNaN(slotIndex)){
				dispatch(Actions.Stain.SetSlot(slotIndex, flower))
			}
		}

		Array.prototype.forEach.call(document.querySelectorAll('.panel'), (panel => {
			panel.removeEventListener('touchmove', forbidScroll)
		}))
	}

	const forbidScroll = ev => ev.preventDefault()

	const onTouchStart = ev => {
		const shadowNode = document.getElementById(shadowId).cloneNode() as HTMLElement

		shadowNode.id = `shadowing-${ shadowId }`
		shadowNode.className = `shadowing ${ shadowClassName }`

		const { clientX: x, clientY: y } = ev.touches[0]

		shadowNode.style.left = `${ x }px`
		shadowNode.style.top = `${ y }px`

		document.body.appendChild(shadowNode)

		Array.prototype.forEach.call(document.querySelectorAll('.panel'), (panel => {
			panel.addEventListener('touchmove', forbidScroll)
		}))
	}

	const onTouchMove = ev => {
		const shadowNode = document.getElementById(`shadowing-${ shadowId }`)

		const { clientX: x, clientY: y } = ev.touches[0]

		shadowNode.style.left = `${ x }px`
		shadowNode.style.top = `${ y }px`
	}

	const className = `flower`

	const style = `background-color:rgb(${ rgbValue });`

	const shadowClassName = 'flower-shadow icon icon-droplet'

	const shadowStyle = `color:rgb(${ rgbValue });`

	return (
		<span class={ className } style={ style } draggable="true" onDragStart={ onDragStart } onTouchEnd={ onTouchEnd } onTouchStart={ onTouchStart } onTouchMove={ onTouchMove }>
			<span class="flower-text">
				{ flower.name }
				<br/>
				{ flower.color.map(s => `${ s }%`).join(',') }
			</span>
			<span id={ shadowId } class={ shadowClassName } style={ shadowStyle }></span>
		</span>
	)
}
