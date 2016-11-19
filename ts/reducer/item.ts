import Actions from '../actions'

import Store from '../types/store'

type State = Store.Item

const defaultState: State = {
	list: [],
	selected: {
		name: 'dummy',
		baseUri: '/resource/img/somesim/Dummy/base.png',
		maskUri: '/resource/img/somesim/Dummy/mask.png',
	}
}

export default (state: State = defaultState, action: Actions.Item.Action) => {
	switch (action.type) {
		case Actions.Item.Types.Select:
			return Object.assign({}, state, {
				selected: action.item
			})
		case Actions.Item.Types.SetList:
			return Object.assign({}, state, {
				list: action.list
			})
		default:
			return state
	}
}
