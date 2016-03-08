import {Enum} from 'rusted';

import Color from '../structs/color';

import {ControlMode} from '../store/control-mode';

import {dispatch} from '../dispatcher';


export let Action=Enum({
	SelectItem:'string',
	SelectFlowerSlot:'number',
	RequestFetch:'string',
	RequestSend:'string',
	RequestOk:'any',
	RequestErr:'any',
	SelectColor:'object',
	SelectFlower:'any',
	ClearFlowers:null,
	ClearFlower:null,
	SetFlowers:'object',
	RecieveFlowerList:'any',
	RecieveStainList:'any',
	RecieveEquipList:'any',
	RecieveReadme:'string',
	RecieveUpdateLog:'string',
	ChangeControlMode:ControlMode
});
