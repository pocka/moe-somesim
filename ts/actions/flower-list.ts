import { Action as ActionBase } from 'redux'

import { FlowerGroup } from '../types/flower'

namespace FlowerList {

	export interface Action extends ActionBase {
		list?: FlowerGroup[]
	}

	export namespace Types {
		export const Set = 'FLOWERLIST.SET'
		export const Clear = 'FLOWERLIST.CLEAR'
	}

	export function Set(list: FlowerGroup[]): Action {
		return { type: Types.Set, list }
	}

	export function Clear(): Action {
		return { type: Types.Clear }
	}
}

export default FlowerList
