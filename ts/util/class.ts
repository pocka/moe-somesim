export function compose(...classNames: (string|boolean|void)[]){
	return classNames.filter(className => !!className).join(' ')
}
