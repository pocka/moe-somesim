if (!global._babelPolyfill) {
	require('babel-polyfill');
}

import {match} from 'rusted';

import EquipStore from './store/equip';
import ColorStore from './store/color';

import load_resources from './util/load-resource';

import {destroy} from './view';

import {destroy as destroy_canvas,initialize as init_canvas,blend,load} from './util/canvas';

let splash=document.getElementById('somesim--splash');

window.setTimeout(()=>{
	splash.classList.add('somesim--splash--hidden');
},1000);

window.pjax.addEventListener('destruct',()=>{
	destroy();
	destroy_canvas();
	window.pjax.clearEventListener();
});

load_resources();

init_canvas();

EquipStore.observe(action=>{
	match(action,{
		Change:()=>{
			match(EquipStore.selected_uri,{
				Some:uri=>{
					load(uri);
				},
				None:null
			});
		},
		_:null
	});
});

ColorStore.observe(action=>{
	match(action,{
		Change:()=>{
			blend(ColorStore.color);
		},
		_:null
	});
});
