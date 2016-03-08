import {
	impl,match,struct,mut,Enum,
	Ok,Err,Some,None,Option
} from 'rusted';

import {Store,Event} from './store';
import Color from '../structs/color';
import FlowerInfo from '../structs/flower';
import FlowerGener from '../structs/flower-gener';

import {FlowerOption,Flower,Nil} from '../types/flower-option';

import color_store from './color';

import get_color_index from '../util/get-color-index';
import blend from '../util/blend-flower';


// ストア定義
let FlowerStore=struct({
	// 花びらスロット
	// Array<Option<Color>>
	slot:mut(Array),
	// 花びらリスト(Option<Array<FlowerGener>>)
	// Option型なのは花びら定義を外部リソースとして管理している為
	list:mut(Option),
	// 現在どのスロットを選択しているのか
	// Option<int>
	// 何も選択していない=None
	selected_slot:mut(Option)
});

impl(FlowerStore,{
	// クリエイタ
	$new(){
		return FlowerStore({
			slot:[None,None,None,None],
			list:None,
			selected_slot:Some(0)
		});
	},
	// ストアの花びらスロットに花びらをセットする
	// スロットから花びらを除去したい場合はFlowerOption::Nilをセットする
	// @param color:Color 花びらの色
	// @return Result
	set(self,color){
		return match(self.selected_slot,{
			Some:slot=>{
				self.slot[slot]=Some(color);
				self.emit(Event.Change);
				return Ok();
			},
			None:()=>{
				self.select_flot(0);
				return self.set(color);
			}
		});
	},
	// すべてのスロットを統一する
	set_all(self,color){
		self.slot[0]=Some(color);
		self.slot[1]=Some(color);
		self.slot[2]=Some(color);
		self.slot[3]=Some(color);
		self.emit(Event.Change);
	},
	// ストアの花びらスロットを空にする
	clear(self){
		match(self.selected_slot,{
			Some:slot=>{
				self.slot[slot]=None;
			},
			None:null
		});
		self.emit(Event.Change);
	},
	// ストアのすべての花びらスロットをクリアする
	clear_all(self){
		self.slot[0]=None;
		self.slot[1]=None;
		self.slot[2]=None;
		self.slot[3]=None;
		self.emit(Event.Change);
	},
	// スロットを選択、または解除する
	// @param index:number
	// 		スロットNo.
	// 		有効なインデックスでない場合は選択解除
	select_slot(self,index){
		if(index>=self.slot.length||index<0){
			self.selected_slot=None;
		}else{
			self.selected_slot=Some(index);
			self.emit(Event.Change);
		}
	},
	// 指定されたIDを持つ花びらを検索する
	// @return Result
	find(self,id){
		return match(self.list,{
			Some:list=>{
				let result=list.map(gener=>{
					return match(gener.find(id),{
						Some:flower=>flower,
						None:()=>null
					});
				}).filter(x=>x!==null).pop();

				return result
					? Ok(result)
					: Err('指定されたIDの花びらは存在しません') ;
			},
			None:()=>{
				return Err('花びら定義ファイルが読み込まれていない為、花びら情報が取得できません');
			}
		});
	}
});

impl(Store,FlowerStore);

let store=FlowerStore.new();

store.observe(action=>{
	match(action,{
		Change:x=>{
			let {r,g,b}=blend(store.slot);
			color_store.set(r,g,b);
		},
		_:()=>{
			return null;
		}
	});
});

store.register(action=>{
	match(action,{
		RecieveFlowerList:json=>{
			let geners=Object.keys(json).map(gener=>{
				let list=Object.keys(json[gener]).map(name=>{
					return FlowerInfo.new(
						name,
						json[gener][name][0],
						json[gener][name][1],
						json[gener][name][2]
					);
				});
				return FlowerGener.new(gener,list);
			});
			store.list=Some(geners);
			store.emit(Event.Change);
		},
		SelectFlowerSlot:index=>{
			store.select_slot(index);
		},
		SelectFlower:color=>{
			store.set(color);
		},
		SetFlowers:color=>{
			store.set_all(color);
		},
		ClearFlowers:()=>{
			store.clear_all();
		},
		ClearFlower:()=>{
			store.clear();
		},
		_:()=>null
	});
});

export default store;
