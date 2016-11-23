import { Action as ActionInterface } from 'redux'

namespace Load {
	export interface Action extends ActionInterface {}

	export namespace Types {
		export const Start = 'LOAD.START'
		export const LoadBase = 'LOAD.BASE'
		export const LoadMask = 'LOAD.MASK'
	}

	export function Start(): Action {
		return { type: Types.Start }
	}

	export function BaseComplete(): Action {
		return { type: Types.LoadBase }
	}

	export function MaskComplete(): Action {
		return { type: Types.LoadMask }
	}
}

export default Load
