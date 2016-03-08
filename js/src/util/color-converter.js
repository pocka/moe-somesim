import {
	Ok,Err
} from 'rusted';

import flower_color_map from './flower-color-map';

// パーセント表記の値を花びらマップを用いてRGB表記の値に変換する
// @param v:int パーセント表記の数値
// @return Result
let convert_to_rgb= v=>{
	let value= flower_color_map.filter(map=>{
		return v===map[0];
	}).pop();

	return value
		? Ok(value[1])
		: Err('指定したパーセント表記の色は、マップ表に存在しません') ;
};

export default convert_to_rgb;
