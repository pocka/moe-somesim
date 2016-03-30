import req from 'superagent';

import {dispatch} from '../dispatcher';

import {Action} from '../actions';

import meta from '../meta';

const DIR_CONFIG='/resource/config/app/moe/somesim',
	  DIR_DOC='/resource/markdown/app/moe/somesim';

export default ()=>{
	req
		.get(DIR_CONFIG+'/somesim.json?='+meta.version)
		.end((err,res)=>{
			dispatch(Action.RecieveEquipList(JSON.parse(res.text)));
		});

	req
		.get(DIR_CONFIG+'/flower.json?='+meta.version)
		.end((err,res)=>{
			dispatch(Action.RecieveFlowerList(JSON.parse(res.text)));
		});

	req
		.get(DIR_CONFIG+'/pallet.json?='+meta.version)
		.end((err,res)=>{
			dispatch(Action.RecieveStainList(JSON.parse(res.text)));
		});

	req
		.get(DIR_DOC+'/readme.md?='+meta.version)
		.end((err,res)=>{
			dispatch(Action.RecieveReadme(res.text));
		});

	req
		.get(DIR_DOC+'/update.md?='+meta.version)
		.end((err,res)=>{
			dispatch(Action.RecieveUpdateLog(res.text));
		});
}
