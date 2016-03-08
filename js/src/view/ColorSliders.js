/** @jsx element */
import {element} from 'deku';

let percentage=n=>((n/255*100)|0);

// prop list
// ________________________________
// | name	| type		| nessesary
// |--------|-----------|----------
// | rgb	| Color		| true
// | hsv	| object	| true
// -------------------------------
//
function render({props}){
	let rgb=props.rgb,
		rgbp=rgb
			?{
				r:percentage(rgb.r),
				g:percentage(rgb.g),
				b:percentage(rgb.b)
			}
			:null,
		hsv=props.hsv||{
			h:0,
			s:0,
			v:0
		};

	let onchange=(value,handler,type)=>{
		handler({
			[type]:Number(value),
			target:['h','s','v'].indexOf(type)>-1
				? 'hsv' : 'rgb'
		});
	};

	return (
		<div class="color-slider--container">
			<div class="color-slider--group color-slider--rgb">
				<p class="color-slider--slider" title="赤色成分 : 0-255">	<label>R:
						<input type="range" step="1" max="255" min="0" value={rgb.r} onInput={
							({target})=>{onchange(target.value,props.onChange,'r')}
						}></input>{' '}
						<span class="color-slider--value">{rgb.r+(rgbp?' ( '+rgbp.r+'% )':'')}</span>
				</label></p>
				<p class="color-slider--slider" title="緑色成分 : 0-255">	<label>G:
						<input type="range" step="1" max="255" min="0" value={rgb.g} onInput={
							({target})=>{onchange(target.value,props.onChange,'g')}
						}></input>{' '}
						<span class="color-slider--value">{rgb.g+(rgbp?' ( '+rgbp.g+'% )':'')}</span>
				</label></p>
				<p class="color-slider--slider" title="青色成分 : 0-255">	<label>B:
						<input type="range" step="1" max="255" min="0" value={rgb.b} onInput={
							({target})=>{onchange(target.value,props.onChange,'b')}
						}></input>{' '}
						<span class="color-slider--value">{rgb.b+(rgbp?' ( '+rgbp.b+'% )':'')}</span>
				</label></p>
			</div>
			<div class="color-slider--group color-slider--hsv">
				<p class="color-slider--slider" title="色相 : 0-360">	<label>H:
						<input type="range" step="1" max="360" min="0" value={hsv.h} onInput={
							({target})=>{onchange(target.value,props.onChange,'h')}
						}></input>{' '}
						<span class="color-slider--value">{hsv.h}</span>
				</label></p>
				<p class="color-slider--slider" title="彩度 : 0-100">	<label>S:
						<input type="range" step="1" max="100" min="0" value={hsv.s} onInput={
							({target})=>{onchange(target.value,props.onChange,'s')}
						}></input>{' '}
						<span class="color-slider--value">{hsv.s}</span>
				</label></p>
				<p class="color-slider--slider" title="輝度 : 0-100"><label>V:
						<input type="range" step="1" max="100" min="0" value={hsv.v} onInput={
							({target})=>{onchange(target.value,props.onChange,'v')}
						}></input>{' '}
						<span class="color-slider--value">{hsv.v}</span>
				</label></p>
			</div>
		</div>
		);
}


export default render;
