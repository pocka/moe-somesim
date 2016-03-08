export default function(uri,callback){
	setTimeout(()=>{
		let img=new Image(),
		onload=()=>{
			callback(img);
		};

		img.onload=onload;
		img.src=uri;
	},0);
}
