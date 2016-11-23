import Actions from '../actions'

import { Item, ItemData } from '../types/item'


interface Props {
	item: Item
	selected: ItemData
}

export default ({ props, dispatch }) => {
	const { item, selected } = props as Props

	return (
		<ul class="item">
			<span class="item-name">
				{ item.name }
			</span>
			{
				item.data.map(data => {
					const onClick = () => {
						if (data != selected){
							dispatch(Actions.Item.Select(dispatch, data))
						}
					}

					return (
						<li class="item-data" onClick={ onClick }>
							{ data.name }
						</li>
					)
				})
			}
		</ul>
	)
}
