import {register} from '../dispatcher';

import {trait,impl,Enum} from 'rusted';

export let Store=trait({

	emit(self){
		if(!self.__observers){
			self.__observers=[];
		}

		self.__observers.forEach(observer=>{
			observer(self);
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
