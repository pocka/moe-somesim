interface TabItemProps {
	title: string
	onClick?: (ev: Event) => void
	default?: boolean
	group: string
	class?: string
}

export function TabItem({ props, children }): deku.VirtualElement {
	const { title, onClick, default: $default, group, class: className } = props as TabItemProps

	const id = `tab--${ encodeURI(title) }`

	return (
		<div class="tab-item">
			<input id={ id } class="tab-state"
				type="radio" checked={ !!$default } name={ group } />
			<label for={ id } class="tab-title" onClick={ onClick }>
				{ title }
			</label>
			<div class={ `tab-contents ${ className }` }>
				{ children }
			</div>
		</div>
	)
}


export function Tab({ children }): deku.VirtualElement {

	return (
		<div class="tab-container">
			{ children }
		</div>
	)
}
