import { ColorPercentage, Rgb } from './color'

export type FlowerSlot = Flower | null

export interface Flower {
	name: string
	color: ColorPercentage
	rgb: Rgb
}

export interface FlowerGroup {
	name: string
	flowers: Flower[]
}
