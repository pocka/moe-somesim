import {impl,struct,mut,Enum,match} from 'rusted';

import {Store} from './store';

export let ControlMode=Enum({
	Color:null,
	Flower:null,
	Pallet:null,
	Equip:null
});

let ControlStoreStruct=struct({
	mode:mut(ControlMode)
});

impl(ControlStoreStruct,{
	$new(init=ControlMode.Flower){
		return ControlStoreStruct({
			mode:init
		});
	}
});

impl(Store,ControlStoreStruct);

export let ControlStore=ControlStoreStruct.new();

ControlStore.register(action=>{
	match(action,{
		ChangeControlMode:mode=>{
			ControlStore.mode=mode;
			ControlStore.emit();
		},
		_:null
	});
});
