import {element} from 'deku';

import meta from '../meta';

let Info=(
	<div class="somesim--information">
		<h3>プロジェクト名</h3>
		<p>{meta.name}</p>
		<h3>バージョン</h3>
		<p>{meta.version}</p>
		<h3>使用モジュール</h3>
		{
			Object.keys(meta.dependencies).map(name=>{
				return (
					<p>{name+':'+meta.dependencies[name]}</p>
				);
			})
		}
		<h3>開発時使用モジュール</h3>
		{
			Object.keys(meta.devDependencies).map(name=>{
				return (
					<p>{name+':'+meta.devDependencies[name]}</p>
				);
			})
		}
	</div>
);

export default Info;
