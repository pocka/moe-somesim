import { ItemGroup, ItemData } from '../types/item'

import { Accordion, AccordionItem } from './accordion'
import Item from './item'


interface Props {
	items: ItemGroup[]
	selected: ItemData
}

export default ({ props }) => {
	const { items, selected } = props as Props

	return (
		<Accordion>
			{
				items.map(group => {
					return (
						<AccordionItem name={ `${ group.name } (${ group.items.length })` } group="item">
							{
								group.items.map(item => (
									<Item item={ item } selected={ selected } />
								))
							}
						</AccordionItem>
					)
				})
			}
		</Accordion>
	)
}
