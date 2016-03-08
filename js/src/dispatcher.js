/*
 * Dispatcher
 */

let registry=[];

export let register= callback=>{
	registry[registry.length]=callback;
}

export let dispatch= action=>{
	for(let i=registry.length-1;i>=0;i=i-1){
		registry[i](action);
	}
}
