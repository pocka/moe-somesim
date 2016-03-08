import {Some,None} from 'rusted';

import flower_color_map from './flower-color-map';

// RGB表記の数値から花びらマップ上のインデックスを取得する
// @param v:int 0-255の数値
// @return Option
export default v=>{
	let index=flower_color_map.map((map,i)=>{
		return v===map[1]
			? i
			: null ;
	}).filter(i=>i!==null).pop();

	return index>=0
		? Some(index)
		: None ;
};
