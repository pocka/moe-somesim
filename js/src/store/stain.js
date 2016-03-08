/**
 * パレットに表示する染色液(Stain)を管理するストア
 */

import {
	impl,match,struct,mut,Enum,
	Ok,Err,Some,None,Option
} from 'rusted';

import {Store,Event} from './store';
import Color from '../structs/color';
import Stain from '../structs/stain';


// ストア定義
let StainStore=struct({
	// リスト(Option<Array<Stain>>)
	// Option型なのはリストを外部リソースとして管理している為
	list:mut(Option)
});

impl(StainStore,{
	// クリエイタ
	$new(){
		return StainStore({
			list:None
		});
	},
	// リストを読み込む
	load(self,list){
		self.list=Some(list);
	}
});

impl(Store,StainStore);

let store=StainStore.new();

store.register(action=>{
	match(action,{
		RecieveStainList:json=>{
			let list=[[]].concat(Object.keys(json).map(gener=>{
				let list=json[gener];
				return list.map(stain=>{
					return Stain.new(Color.parse(stain.rgb),stain.name,stain.src);
				});
			})).reduce((dest,list)=>{
				return dest.concat(list);
			});
			store.load(list);
		},
		_:()=>null
	});
});

export default store;
