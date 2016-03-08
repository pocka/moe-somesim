import {match} from 'rusted';

import {element} from 'deku';

import ColorTip from './ColorTip';

// prop list
// ________________________________________
// | name		| type			| nessesary
// |------------|---------------|----------
// | list		| Array<Flower>	| true
// | 			| Array<Stain>	| true
// | onChange	| function		| false
// ----------------------------------------
//
export default ({props,children})=>{
	return (
		<div class="color--color-pallet">
			{
				props.list.map(info=>{
					return <ColorTip name={
						match(info.source||'',{
							Some:source=>{
								return (
									<span>
										{info.name}
										<br/>
										({source})
								 	</span>
								);
							},
							_:()=>{
								return info.name;
							}
						})
					} color={info.color} onChange={props.onChange}/>
				})
			}
		</div>
	);
};
