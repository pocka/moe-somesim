interface Props {
	value: number
	onInput: (ev: Event) => void
	max: number
}

export default ({ props }) => {
	const { value, onInput, max } = props as Props

	return (
		<input type="range" min="0" max={ max } step="1" class="slider" value={ value } onInput={ onInput } />
	)
}
