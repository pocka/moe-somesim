interface AccordionItemProps {
	name: string
	group: string
}


export function AccordionItem({ props, children }): deku.VirtualElement {
	const { name, group } = props as AccordionItemProps

	const id = encodeURI(name)

	return (
		<li class="accordion-item">
			<input type="checkbox" class="accordion-state" id={ id } name={ group } />
			<label for={ id } class="accordion-name">
				{ name }
			</label>
			<div class="accordion-contents">
				{ children }
			</div>
		</li>
	)
}

interface AccordionProps {
	class?: string
}

export function Accordion({ children, props }): deku.VirtualElement {
	const { class: className } = props as AccordionProps
	return (
		<ul class={ `accordion ${ className }` }>
			{ children }
		</ul>
	)
}
