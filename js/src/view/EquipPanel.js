import {element} from 'deku';

import md5 from 'spark-md5';

import {match} from 'rusted';

import {Action} from '../actions/';

// prop list
// ____________________________
// | name	| type		| nessesary
// |--------|-----------|----------
// | name	| string	| true
// ----------------------------
//
let Branch=({props,children})=>{
	let id=`equip-panel--gener--checkbox--${md5.hash(props.name)}`;
	return (
		<div class="equip-panel--container">
			<input type="checkbox" class="equip-panel--gener--checkbox" id={id}/>
			<label class="equip-panel--gener" for={id}>
				{`${props.name} (${children.length})`}
			</label>
			<div class="equip-panel--gener--item--container">
				{children.map(item=><Node item={item}/>)}
			</div>
		</div>
	);
};

// prop list
// ________________________________
// | name	| type		| nessesary
// |--------|-----------|----------
// | item	| Object	| true
// --------------------------------
//
// * item must be fetched equip information object type below
// 	 {
// 	 	uri:string,
// 	 	caption:string
// 	 }
//
let Node=({props,dispatch})=>{
	return (
		<p class="equip-panel--item" onClick={
			()=>{dispatch(Action.SelectItem(props.item.uri))}
		}>
			{props.item.caption||'不正なデータ'}
		</p>
	);
};

// prop list
// ____________________________________
// | name	| type			| nessesary
// |--------|---------------|----------
// | list	| Object		| true
// ------------------------------------
//
let Tree=({props})=>{
	return (
		<div>
			{
				Object.keys(props.list).map(gener=><Branch name={gener}>{props.list[gener]}</Branch>)
			}
		</div>
	);
};

// prop list
// ____________________________________
// | name	| type			| nessesary
// |--------|---------------|----------
// | list	| Array<Object>	| true
// ------------------------------------
//
export default ({props,dispatch,children})=>{
	return (
		<div class="equip-panel--container">
			{
				match(props.list,{
					Some:list=><Tree list={list} />,
					None:()=><p>アイテムリストを読込中です...</p>
				})
			}
		</div>
	);
}
