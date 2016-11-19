import Actions from '../actions'

import Store from '../types/store'

type State = Store.Pallets

const defaultState: State = []

export default (state: State = defaultState, action: Actions.Pallets.Action) => {
	switch (action.type){
		case Actions.Pallets.Types.Add:
			return state.concat(action.pallet)
		case Actions.Pallets.Types.Remove:
			return state.filter(pallet => pallet.id !== action.pallet.id)
		case Actions.Pallets.Types.Update:
			return state.map(pallet => pallet.id !== action.pallet.id ? pallet : action.pallet)
		default:
			return state
	}
}
