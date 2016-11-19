import { Action as ActionInterface } from 'redux'

import { ItemGroup, ItemData } from '../types/item'

namespace Item {

	interface ListAction extends ActionInterface {
		list: ItemGroup[]
	}

	interface ItemAction extends ActionInterface {
		item: ItemData
	}

	export interface Action extends ListAction, ItemAction {}

	export namespace Types {
		export const Select = 'ITEM.SELECT'
		export const SetList = 'ITEM.SETLIST'
	}

	export function Select(dispatch: Function, item: ItemData): ItemAction {
		return { type: Types.Select, item }
	}

	export function SetList(list: ItemGroup[]): ListAction {
		return { type: Types.SetList, list }
	}
}

export default Item
