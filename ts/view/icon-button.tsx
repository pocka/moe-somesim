interface Props {
	icon: string
	class?: string
	onClick: (ev: Event) => void
	title?: string
}

export default ({ props }) => {
	const { icon, class: className, onClick, title } = props as Props

	return (
		<span class={ `icon-button icon icon-${ icon } ${ className }` } onClick={ onClick } title={ title } role="button" tabindex="0" aria-pressed="false"></span>
	)
}

