import {register} from '../dispatcher';

import {trait,impl,Enum} from 'rusted';

export let Store=trait({
	emit(self,action){
		if(!self.__observers){
			self.__observers=[];
		}
		self.__observers.forEach( observer=>{
			observer(action);
		});
	},
	observe(self,callback){
		if(!self.__observers){
			self.__observers=[];
		}
		self.__observers.push(callback);
	},
	register(self,callback){
		register(callback);
	}
});

export let Event=Enum({
	Change:null
});
