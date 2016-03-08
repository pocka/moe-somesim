import {
	impl,match,struct,
	panic
} from 'rusted';

import uid from 'uid';

import Color from './color';

import convert from '../util/color-converter';

// 花びら情報を表す
let FlowerInfo=struct({
	id:'string',
	name:'string',
	color:Color
});

impl(FlowerInfo,{
	// クリエイタ
	// r,g,bの各値はパーセント表記
	$new(name,r,g,b){
		return FlowerInfo({
			id:uid(),
			name:name,
			color:Color.new(
				convert(r).unwrap(),
				convert(g).unwrap(),
				convert(b).unwrap()
			)
		});
	}
});

export default FlowerInfo;
