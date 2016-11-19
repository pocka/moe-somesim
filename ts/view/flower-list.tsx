import { FlowerGroup, FlowerSlot } from '../types/flower'

import Flower from './flower'
import { Accordion, AccordionItem } from './accordion'


interface Props {
	list: FlowerGroup[]
	slots: FlowerSlot[]
}


export default ({ props }) => {
	const { list, slots } = props as Props

	return (
		<Accordion class="flower-list">
			{
				list.map(group => {
					return (
						<AccordionItem name={ group.name } group="flower">
							{
								group.flowers.map(flower => <Flower flower={ flower } slots={ slots } />)
							}
						</AccordionItem>
					)
				})
			}
		</Accordion>
	)
}
