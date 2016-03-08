import {element} from 'deku';

// prop list
// ____________________________
// | name	| type	| nessesary
// |--------|-------|----------
// | color	| Color	| true
// ----------------------------
//
let URIBox=({props})=>{
	let uri='http://pocka.onl/app/moe/somesim/rgb-'+props.color.to_hex()+'/';

	return (
		<p>
			<label for="uri_output">出力URL:</label>
			<input type="text" id="uri_output" value={uri}></input>
		</p>
	);
};

export default {render:URIBox};
