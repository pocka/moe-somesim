import {impl,struct,mut,Enum,match,Option,None,Some} from 'rusted';

import {Store} from './store';

const filterEquipList = list => {
    let tmp = {};

    Object.keys(list).forEach(key => {
        if (list[key].length){
            tmp[key] = list[key]
        }
    });

    return tmp
};

// ストア定義
// @prop mut list: Option<object>
// 		リスト実体。読み込まれるまではNone
// @prop mut selected_uri: Option<string>
// 		選択された画像のURI。読み込まれるまではNone
let EquipStore=struct({
	list:mut(Option),
	selected_uri:mut(Option)
});

impl(EquipStore,{
	$new(){
		return EquipStore({
			list:None,
			selected_uri:None
		});
	},
	load_list(self,list){
		self.list=Some(filterEquipList(list));
		self.selected_uri=Some(list[Object.keys(list)[0]][0].uri);
		self.emit();
	}
});

impl(Store,EquipStore);

let store=EquipStore.new();

store.register(action=>{
	match(action,{
		RecieveEquipList:json=>{
			store.load_list(json);
		},
		SelectItem:uri=>{
			match(store.selected_uri,{
				None:()=>{
					store.selected_uri=Some(uri);
					store.emit();
				},
				Some:old=>{
					if(old!==uri){
						store.selected_uri=Some(uri);
						store.emit();
					}
				}
			});
		},
		_:null
	});
});

export default store;
