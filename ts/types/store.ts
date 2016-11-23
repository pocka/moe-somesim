import { Rgb, Hsv } from './color'

import Pallet from './pallet'
import { ItemGroup, ItemData } from './item'
import { FlowerGroup, FlowerSlot } from './flower'

namespace Store {

	export interface Item {
		list: ItemGroup[]
		selected: ItemData
	}

	export interface Stain {
		rgb: Rgb
		hsv: Hsv
		flowerSlot: FlowerSlot[]
		bleach: number
	}

	export type Pallets = Pallet[]

	export type FlowerList = FlowerGroup[]

	export type IsLoading = [boolean, boolean]
}

export default Store
