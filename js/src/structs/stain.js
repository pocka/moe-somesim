/**
 * 染色液を表すstruct
 */

import {
	struct,impl,match,
	Option,Some,None
} from 'rusted';

import Color from './color';

// 染色液(パレットで使用)を表す
// @property color:Color
// 		染色液の色
// @property name:string
// 		染色液の名前(通称とか色名とか)
// @property source:Option<string>
// 		染色液の作り方、出自(基本的には花びらの組み合わせ)
let Stain=struct({
	color:Color,
	name:'string',
	source:Option
});

impl(Stain,{
	$new(color,name,source){
		return Stain({
			color:color,
			name:name,
			source:source?Some(source):None
		});
	}
});

export default Stain;
