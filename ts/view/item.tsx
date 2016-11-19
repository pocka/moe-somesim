import Actions from '../actions'

import { Item } from '../types/item'


interface Props {
	item: Item
}

export default ({ props, dispatch }) => {
	const { item } = props as Props

	return (
		<ul class="item">
			<span class="item-name">
				{ item.name }
			</span>
			{
				item.data.map(data => {
					const onClick = () => {
						dispatch(Actions.Item.Select(dispatch, data))
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
