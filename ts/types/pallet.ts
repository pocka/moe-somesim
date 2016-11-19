import { Rgb } from './color'


interface Pallet {
	id: number,
	color: Rgb,
	name: string,
	description?: string
}

export default Pallet
