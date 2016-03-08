import ColorStore from '../store/color';

import load_image from './load-image';

// サイズを表す配列のインデックス指定用(抽象化)
const WIDTH=0,
	  HEIGHT=1;

// 初期サイズ
const INIT_SIZE=[400,400];

// コンテナ
let container=document.getElementById('canvas-wrapper');

// キャンバス設定用
let cvs_main=document.getElementById('canvas'),
	cvs_base=document.getElementById('canvas_result_texture'),
	cvs_mask=document.getElementById('canvas_result_alpha');

// キャンバス操作用
let ctx_main=cvs_main.getContext('2d'),
	ctx_base=cvs_base.getContext('2d'),
	ctx_mask=cvs_mask.getContext('2d');

// キャンバスサイズを取得する
let get_size=(base_width,base_height)=>{
	let container_size=[container.offsetWidth,container.offsetHeight];

	if(base_height<=container_size[HEIGHT]){
		if(base_width<=container_size[WIDTH]){
			// 縮小なしでコンテナに収まり切る場合
			return [base_width,base_height];
		}else{
			// 幅がコンテナを超えている場合
			let fix=container_size[WIDTH]/base_width;
			return [container_size[WIDTH],base_height*fix];
		}
	}else{
		let fix=container_size[HEIGHT]/base_height;
		if(base_width*fix>container_size[WIDTH]){
			// 縦に合わせた縮小をしても、まだコンテナに幅が収まり切らない場合
			let fix=container_size[WIDTH]/base_width;
			return [container_size[WIDTH],base_height*fix];
		}else{
			// 縦を基準にした縮小で収まる場合
			return [base_width*fix,container_size[HEIGHT]];
		}
	}
};

// キャンバスのサイズを設定する
// @param w:float 基準となる幅
// @param h:float 基準となる高さ
let resize=(w,h)=>{
	let [width,height]=get_size(w,h);

	cvs_main.width=width;
	cvs_main.height=height;

	cvs_base.width=width;
	cvs_base.height=height;

	cvs_mask.width=width;
	cvs_mask.height=height;

	paint_buffer();
};

// バッファの内容
let bit_base=null,
	bit_mask=null;

// 読み込んだ画像
let img_base=null,
	img_mask=null;

// バッファに画像を描画する
let paint_buffer=()=>{
	if(!img_base||!img_mask){
		return;
	}
	let width=cvs_base.width,
		height=cvs_base.height;

	ctx_base.drawImage(img_base,0,0,width,height);
	ctx_mask.drawImage(img_mask,0,0,width,height);

	bit_base=ctx_base.getImageData(0,0,width,height).data;
	bit_mask=ctx_mask.getImageData(0,0,width,height).data;

	blend_dispatch(ColorStore.color);
};

window.addEventListener('resize',()=>{
	let width=img_base?img_base.width:INIT_SIZE[WIDTH],
		height=img_base?img_base.height:INIT_SIZE[HEIGHT];
	resize(width,height);
});

// 色を計算し、メインキャンバスに描画する
let blend=(r,g,b)=>{
	if(!bit_base||!bit_mask){
		return;
	}
	let dest=ctx_main.createImageData(cvs_main.width,cvs_main.height),
		data=dest.data,
		i=(data.length-1)|0;
	while(i>=3){
		data[i-3]=(r*bit_mask[i-3]/255)+bit_base[i-3];
		data[i-2]=(g*bit_mask[i-2]/255)+bit_base[i-2];
		data[i-1]=(b*bit_mask[i-1]/255)+bit_base[i-1];
		data[i-0]=(255)|0;
		i=(i-4)|0;
	}
	ctx_main.putImageData(dest,0,0);
};

// レンダリングフレームでのみ描画するようディスパッチする
let blend_dispatch=({r,g,b})=>{
	window.requestAnimationFrame(()=>blend(r,g,b));
};

export { blend_dispatch as blend}

// 画像を読み込む
// 指定するファイルのURIは_baseや_color抜きのもの
export function load(uri){
	img_base=null,img_mask=null;
	let complete=(base,mask)=>{
			img_base=base||img_base;
			img_mask=mask||img_mask;
			if(img_base&&img_mask){
				resize(img_base.width,img_base.height);
				paint_buffer();
			}
		};
	load_image(uri.replace('.png','_base.png'),img=>{
		complete(img,null);
	});
	load_image(uri.replace('.png','_color.png'),img=>{
		complete(null,img);
	});
}

// 初期化
export function initialize(){
	resize(INIT_SIZE[WIDTH],INIT_SIZE[HEIGHT]);
}

// 気持ち程度の参照外し
export function destroy(){
	container=
	ctx_main=ctx_base=ctx_mask=
	cvs_main=cvs_base=cvs_mask=
	get_size=
	blend=blend_dispatch=
	paint_buffer=resize=
	void 0;
}
