import { ItemGroup } from '../types/item'

import { Accordion, AccordionItem } from './accordion'
import Item from './item'


interface Props {
	items: ItemGroup[]
}

export default ({ props }) => {
	const { items } = props as Props

	return (
		<Accordion>
			{
				items.map(group => {
					return (
						<AccordionItem name={ `${ group.name } (${ group.items.length })` } group="item">
							{
								group.items.map(item => (
									<Item item={ item } />
								))
							}
						</AccordionItem>
					)
				})
			}
		</Accordion>
	)
}
