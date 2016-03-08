import {
	Enum
} from 'rusted';

import FlowerInfo from '../structs/flower';

// スロットに装填する花びら型
let FlowerOption=Enum({
	Flower:FlowerInfo,
	Nil:null
});

// アクセサ
let Flower=FlowerOption.Flower,
	Nil=FlowerOption.Nil;

export {
	FlowerOption,
	Flower,
	Nil
};
