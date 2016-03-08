import {mut,struct,impl,match} from 'rusted';

let pad=n=>('0'+n).slice(-2);

let round=n=>((n*10)|0)/10;

let Color=struct({
	r:mut('number'),
	g:mut('number'),
	b:mut('number')
});

impl(Color,{
	$new(r,g,b){
		return Color({
			r:round(r),
			g:round(g),
			b:round(b)
		});
	},
	$parse(str){
		let [r,g,b]=str.split(',');
		return Color.new(Number(r),Number(g),Number(b));
	},
	$from_hsv(h,s,v){
		/*
		 * HSV -> RGB
		 *
		 * MAX=V
		 * MIN=MAX-(S*MAX/100)
		 */
		let max=v/100*255,
			min=max-((s/100)*max);
		let a=(h/60)|0;
		switch(a){
			case 0:
				return [max,(h/60)*(max-min)+min,min];
			case 1:
				return [((120-h)/60)*(max-min)+min,max,min];
			case 2:
				return [min,max,((h-120)/60)*(max-min)+min];
			case 3:
				return [min,((240-h)/60)*(max-min)+min,max];
			case 4:
				return [((h-240)/60)*(max-min)+min,min,max];
			case 5:
				return [max,min,((360-h)/60)*(max-min)+min];
			default:
				return [max,min,((360-h)/60)*(max-min)+min];
		}
	},
	set_rgb(self,r,g,b){
		if(r!==null){
			self.r=round(r);
		}
		if(g!==null){
			self.g=round(g);
		}
		if(b!==null){
			self.b=round(b);
		}
	},
	to_hsv(self){
		let max=Math.max(self.r,self.g,self.b),
			min=Math.min(self.r,self.g,self.b);

		/*
		 * RGB -> HSV
		 *
		 * V = max
		 * S max = max>0 -> 100*(max-min)/max
		 * 		   _	 -> 0
		 * H max min r g b =
		 * 		min=max-> 0
		 * 		_	   -> max=r -> 60*((g-b)/(max-min))+360 mod 360
		 * 			   	  max=b -> 60*((b-r)/(max-min))+120
		 * 			   	  _		-> 60*((r-g)/(max-min))+240
		 */

		return {
			v:round(max/255*100),
			s:round(max>0
					? 100*((max-min)/max)
					: 0.0
				),
			h:round(Math.abs(min===max
					? 0.0
				: max===self.r
					? (60*((self.g-self.b)/(max-min))+360)%360
				: max===self.g
					? 60*((self.b-self.r)/(max-min))+120
					: 60*((self.r-self.g)/(max-min))+240
				))
		};
	},
	to_hex(self){
		return (
			pad((self.r|0).toString(16))+
			pad((self.g|0).toString(16))+
			pad((self.b|0).toString(16))
		);
	},
	to_percentage(self){
		return (
			round(((self.r/255)*100))+'%,'+
			round(((self.g/255)*100))+'%,'+
			round(((self.b/255)*100))+'%'
		);
	}
});

export default Color;
