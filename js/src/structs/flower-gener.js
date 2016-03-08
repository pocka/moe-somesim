import {
	Some,None,
	impl,match,struct,
	panic
} from 'rusted';

import FlowerInfo from './flower';

// 花びらグループを表す
// e.g.) ラーファン, 課金花びら
let FlowerGener=struct({
	// グループ名
	name:'string',
	// グループに属する花びらのリスト
	list:Array
});

impl(FlowerGener,{
	// クリエイタ
	// @param name:string グループ名
	// @param list:Array<FlowerInfo> 花びらリスト
	$new(name,list){
		return FlowerGener({
			name,
			list
		});
	},
	// グループ内に指定したidの花びらがある場合それを取得する
	// @return Option
	find(self,id){
		let matched=self.list.filter(flower=>{
			return flower.id===id;
		}).pop();

		return matched
			? Some(matched)
			: None ;
	}
});

export default FlowerGener;
