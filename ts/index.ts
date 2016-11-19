import './polyfill'

// Redux and it's middlewares
import { createStore } from 'redux'

const reduxPersist = require('redux-persist')
const { persistStore, autoRehydrate } = reduxPersist

import * as localforage from 'localforage'


// deku (view)
import { element as h } from 'deku'

// local components
import reducer from './reducer'

import view from './view'

import fetchList from './util/fetch-list'

import createApp from 'deku-raf'


// -----------------------------------------


const store = createStore(reducer, undefined, autoRehydrate())

persistStore(store, {
	storage: localforage
}, () => {
	fetchList(store.dispatch)
})

const container = document.getElementById('view-somesim')


const app = createApp(container, store.dispatch)

const render = () => {
	app(h(view, store.getState()))
}

store.subscribe(render)

render()
