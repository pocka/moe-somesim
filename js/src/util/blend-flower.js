import {match} from 'rusted';

import {FlowerOption,Flower,Nil} from '../types/flower-option';

import Color from '../structs/color';

import get_color_index from '../util/get-color-index';
import flower_color_map from '../util/flower-color-map';

// 花びらをブレンドする
// @param colors:Array<Option<Color>> 使用する花びら
// @return Color
export default colors=>{
	// すべての花びらのインデックス合計
	let index=[[0,0,0]].concat(colors).reduce((state,color)=>{
		return match(color,{
			Some:color=>{
				return [
					state[0]+get_color_index(color.r).unwrap(),
					state[1]+get_color_index(color.g).unwrap(),
					state[2]+get_color_index(color.b).unwrap()
				];
			},
			None:()=>{
				return state;
			}
		});
	});
	// 調合に使用する花びらの枚数
	let count=colors.filter(flower=>{
		return match(flower,{
			Some:()=>true,
			None:()=>false
		});
	}).length;
	// インデックスに掛け合わせる補正値
	let revise=match(count,{
		1:()=>1,
		2:()=>33/64,
		3:()=>34/99,
		4:()=>33/128,
		_:()=>0
	});
	return Color.new(
		flower_color_map[(index[0]*revise)|0][1],
		flower_color_map[(index[1]*revise)|0][1],
		flower_color_map[(index[2]*revise)|0][1]
	);
};
