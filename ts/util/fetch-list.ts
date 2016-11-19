import { Action } from 'redux'

import Actions from '../actions'

import { Flower, FlowerGroup } from '../types/flower'
import { Item, ItemData, ItemGroup } from '../types/item'

import { percentageToRgb } from '../util/color'


const fetchJson = uri => {
	const headers = new Headers()

	headers.append('Content-Type', 'application/json')

	return fetch(uri, {
		method: 'GET',
		headers,
		cache: 'no-cache'
	}).then(response => {
		if (!response){
			return Promise.reject('Empty resource')
		}

		return response.json()
	})
}


export default (dispatch: (action: Action) => void) => {
	fetchJson('/resource/config/app/moe/somesim/flower.json').then(json => {
		const list: FlowerGroup[] = Object.keys(json).map(key => {
			const flowers = <Flower[]>json[key]

			return {
				name: key,
				flowers: Object.keys(flowers).map(name => {
					// const color = <ColorPercentage>(flowers[key].map(s => parseInt(s)))
					const color = flowers[name]

					return {
						name, color,
						rgb: percentageToRgb(color)
					}
				})
			}
		})

		dispatch(Actions.FlowerList.Set(list))
	}).catch(err => {
		console.error('Failed to fetch flower list.')
	})

	fetchJson('/resource/config/app/moe/somesim/item.json').then(json => {
		const list: ItemGroup[] = Object.keys(json).map<ItemGroup>(name => {
			const group = json[name]

			return {
				name,
				items: Object.keys(group).map<Item>(name => {
					const item = group[name]

					return {
						name,
						data: Object.keys(item).map<ItemData>(name => {
							const uri = <string>item[name]

							return {
								name,
								baseUri: uri.replace(/\.png$/, '_base.png'),
								maskUri: uri.replace(/\.png$/, '_color.png'),
							}
						})
					}
				})
			}
		}).filter(group => group.items.length > 0)

		dispatch(Actions.Item.SetList(list))
	}).catch(err => {
		console.error('Failed to fetch item list.')
	})
}
