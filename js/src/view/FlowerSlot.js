import {element} from 'deku';

import {
	match
} from 'rusted';

import {Action} from '../actions';

let NilSlot=<span class="flower-slot--slot--nil"></span>

// prop list
// ________________________________________
// | name		| type			| nessesary
// |------------|---------------|----------
// | slots		| Array<Color>	| true
// | selected	| Option<int>	| true
// ----------------------------------------
//
export default ({props,dispatch,children})=>{
	let selected=match(props.selected,{
			Some:x=>x,
			None:-1
		});
	return (
		<div class="flower-slot--container">
			{
				props.slots.map((slot,index)=>{
					let select=()=>{
						dispatch(Action.SelectFlowerSlot(index));
					};
					let clear=()=>{
						dispatch(Action.ClearFlower);
					};
					let is_selected=index===selected;
					return match(slot,{
						None:()=>{
							return (
								<span class={
									'flower-slot--slot--nil'+
									(is_selected?' flower-slot--slot--selected':'')
								} onClick={select}>
								</span>
							);
						},
						Some:color=>{
							return (
								<span class={
									'flower-slot--slot'+
									(is_selected?' flower-slot--slot--selected':'')
								} style={
									'background-color:#'+color.to_hex()+';'
								} onClick={is_selected?clear:select}></span>
							);
						}
					});
				})
			}
			<span class="flower-slot--slot--clear" onClick={
				()=>{dispatch(Action.ClearFlowers)}
			} title="全てリセット">
			</span>
		</div>
	);
};
