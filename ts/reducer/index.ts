import { combineReducers } from 'redux'


import item from './item'
import stain from './stain'
import pallets from './pallets'
import flowerList from './flower-list'

export default combineReducers({
	item, stain, pallets, flowerList
})
