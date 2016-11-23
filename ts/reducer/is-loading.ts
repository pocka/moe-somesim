import Actions from '../actions'

import Store from '../types/store'

type State = Store.IsLoading

const defaultState: State = [false, false]

type Action = Actions.Load.Action | Actions.Item.Action

export default (state: State = defaultState, action: Action) => {
	switch (action.type){
		case Actions.Load.Types.Start:
		case Actions.Item.Types.Select:
			return [true, true]
		case Actions.Load.Types.LoadBase:
			return [false, state[1]]
		case Actions.Load.Types.LoadMask:
			return [state[0], false]
		default:
			return state
	}
}
