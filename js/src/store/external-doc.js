/**
 * 更新履歴やreadmeなどのドキュメントを管理するストア
 */

import {
	impl,match,struct,mut,Enum,
	Ok,Err,Some,None,Option
} from 'rusted';

import markdown from 'marked';

import convert_link from '../util/convert-link';

import {Store,Event} from './store';

// ストア定義
let ExternalDocStore=struct({
	// Readme(markdown)
	// mut Option<string>
	readme:mut(Option),
	// 更新履歴(markdown)
	// mut Option<string>
	update:mut(Option)
});

impl(ExternalDocStore,{
	$new(){
		return ExternalDocStore({
			readme:None,
			update:None
		});
	},
	load_readme(self,md){
		self.readme=Some(convert_link(markdown(md)));
		self.emit(Event.Change);
	},
	load_update(self,md){
		self.update=Some(convert_link(markdown(md)));
		self.emit(Event.Change);
	}
});

impl(Store,ExternalDocStore);

let store=ExternalDocStore.new();

store.register(action=>{
	match(action,{
		RecieveReadme:markdown=>{
			store.load_readme(markdown);
		},
		RecieveUpdateLog:markdown=>{
			store.load_update(markdown);
		},
		_:null
	});
});

export default store;
