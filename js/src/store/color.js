import {impl,struct,mut,Enum,match} from 'rusted';

import Color from '../structs/color';
import {Store,Event} from './store';

// ストア定義
let ColorStore=struct({
	color:mut(Color)
});

impl(ColorStore,{
	$new(r,g,b){
		return ColorStore({
			color:Color.new(r,g,b)
		});
	},
	// ストアに色をセットする
	set(self,r,g,b){
		self.color.set_rgb(r,g,b);
		self.emit(Event.Change);
	},
	set_hsv(self,h,s,v){
		let [r,g,b]=Color.from_hsv(h,s,v);
		self.color.set_rgb(r,g,b);
		self.emit(Event.Change);
	}
});

impl(Store,ColorStore);

// 色情報を表すURIトークンをColor型に変換する
let parse= str=>{
	if(!str){
		return null;
	}

	let param=str.replace('rgb-','');

	return [
		parseInt(param.slice(0,2),16),
		parseInt(param.slice(2,4),16),
		parseInt(param.slice(4,6),16)
	];
};

let params=window.location.pathname.split('/'),
	color_by_param = parse(params.filter(param=>{
		return !!param.match(/^rgb\-[A-Fa-f0-9]{6}$/);
	}).pop());

let store=color_by_param
	? ColorStore.new(
		color_by_param[0],
		color_by_param[1],
		color_by_param[2]
	)
	: ColorStore.new(7,158,255) ;

store.register(action=>{
	match(action,{
		SelectColor:c=>{
			if(c.target==='hsv'){
				let o=store.color.to_hsv(),
					h=c.h!==undefined?c.h:o.h,
					s=c.s!==undefined?c.s:o.s,
					v=c.v!==undefined?c.v:o.v;
				store.set_hsv(h,s,v);
			}else{
				let r=c.r!==undefined?c.r:null,
					g=c.g!==undefined?c.g:null,
					b=c.b!==undefined?c.b:null;
				store.set(r,g,b) ;
			}
		},
		_:()=>null
	});
});

export default store;
