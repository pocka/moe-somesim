export interface ItemGroup {
	name: string

	items: Item[]
}

export interface Item {
	name: string

	data: ItemData[]
}

export interface ItemData {
	name: string

	baseUri: string
	maskUri: string
}
