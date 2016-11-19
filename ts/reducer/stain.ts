import Actions from '../actions'

import Store from '../types/store'

import { rgbToHsv, hsvToRgb, combineStain } from '../util/color'

type State = Store.Stain

const validateBleach = n => n > 6 ? 6 : n < 0 ? 0 : n

const defaultState: State = {
	rgb: [0, 0, 0],
	hsv: [0, 0, 0],
	flowerSlot: [null, null, null, null],
	bleach: 0,
}

export default (state: State = defaultState, action: Actions.Stain.Action) => {
	switch (action.type){
		case Actions.Stain.Types.SetColor:
			return Object.assign({}, state, {
				rgb: action.color,
				hsv: rgbToHsv(action.color)
			})
		case Actions.Stain.Types.SetHsv:
			return Object.assign({}, state, {
				hsv: action.hsv,
				rgb: hsvToRgb(action.hsv)
			})
		case Actions.Stain.Types.RefreshColor:
			{
				const rgb = combineStain(state.flowerSlot, state.bleach)

				return Object.assign({}, state, {
					rgb, hsv: rgbToHsv(rgb)
				})
			}
		case Actions.Stain.Types.SetSlot:
			{
				const flowerSlot = state.flowerSlot.map((slot, i) => {
					return i == action.slot
						? action.flower
						: slot
				})

				const rgb = combineStain(flowerSlot, state.bleach)

				return Object.assign({}, state, {
					flowerSlot, rgb,
					hsv: rgbToHsv(rgb)
				})
			}
		case Actions.Stain.Types.ClearSlot:
			{
				const flowerSlot = state.flowerSlot.map((slot, i) => {
					return i == action.slot
						? null
						: slot
				})

				const rgb = combineStain(flowerSlot, state.bleach)

				return Object.assign({}, state, {
					flowerSlot, rgb,
					hsv: rgbToHsv(rgb)
				})
			}
		case Actions.Stain.Types.ClearAllSlots:
			{
				const rgb = combineStain([], state.bleach)

				return Object.assign({}, state, {
					flowerSlot: [null, null, null, null], rgb,
					hsv: rgbToHsv(rgb)
				})
			}
		case Actions.Stain.Types.Bleach:
			{
				const bleach = validateBleach(state.bleach + 1)

				const rgb = combineStain(state.flowerSlot, bleach)

				return Object.assign({}, state, {
					bleach, rgb,
					hsv: rgbToHsv(rgb)
				})
			}
		case Actions.Stain.Types.UnBleach:
			{
				const bleach = validateBleach(state.bleach - 1)

				const rgb = combineStain(state.flowerSlot, bleach)

				return Object.assign({}, state, {
					bleach, rgb,
					hsv: rgbToHsv(rgb)
				})
			}
		case Actions.Stain.Types.SetBleach:
			{
				const bleach = validateBleach(action.bleach)

				const rgb = combineStain(state.flowerSlot, bleach)

				return Object.assign({}, state, {
					bleach, rgb,
					hsv: rgbToHsv(rgb)
				})
			}
		default:
			return state
	}
}
