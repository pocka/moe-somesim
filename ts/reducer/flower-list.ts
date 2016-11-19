import Actions from '../actions'

import Store from '../types/store'

type State = Store.FlowerList

const defaultState: State = []

export default (state: State = defaultState, action: Actions.FlowerList.Action) => {
	switch (action.type){
		case Actions.FlowerList.Types.Set:
			return action.list
		case Actions.FlowerList.Types.Clear:
			return []
		default:
			return state
	}
}
