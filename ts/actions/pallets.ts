import { Action as ActionInterface } from 'redux'

import Pallet from '../types/pallet'
import { Rgb } from '../types/color'

namespace Pallets {

	export interface Action extends ActionInterface {
		pallet: Pallet
	}

	export namespace Types {
		export const Add = 'PALLETS.ADD'
		export const Remove = 'PALLETS.REMOVE'
		export const Update = 'PALLETS.UPDATE'
	}

	export function Add(color: Rgb): Action {
		const id = new Date().valueOf()

		return {
			type: Types.Add,
			pallet: {
				name: 'New Pallet',
				id, color
			}
		}
	}

	export function Remove(pallet: Pallet): Action {
		return { type: Types.Remove, pallet }
	}

	export function UpdateColor(pallet: Pallet, color: Rgb): Action {
		return {
			type: Types.Update,
			pallet: Object.assign({}, pallet, { color })
		}
	}

	export function UpdateName(pallet: Pallet, name: string): Action {
		return {
			type: Types.Update,
			pallet: Object.assign({}, pallet, { name })
		}
	}

	export function UpdateDescription(pallet: Pallet, description: string): Action {
		return {
			type: Types.Update,
			pallet: Object.assign({}, pallet, { description })
		}
	}
}

export default Pallets
