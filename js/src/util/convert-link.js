export default html=>{
	return html
			.replace(/<a href="http/g,'<a target="_blank" href="http');
			//.replace(/<a href="\//g,'<a class="pjax" href="/');
}
