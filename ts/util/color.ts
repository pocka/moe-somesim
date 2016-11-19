import { Rgb, Red, Green, Blue, Hsv, ColorIndex, ColorPercentage } from '../types/color'
import { FlowerSlot, Flower } from '../types/flower'

export const percentageIndex = [
	 0,  3,  6,  9, 12, 16, 19, 22, 25, 29, 32,
	35, 38, 41, 45, 48, 51, 54, 58, 61, 64, 67,
	70, 74, 77, 80, 83, 87, 90, 93, 96, 100
]

export const rgbIndex = [
	  0,   8,  16,  24,  32,  41,
	 49,  57,  65,  74,  82,  90,
	 98, 106, 115, 123, 131, 139,
	148, 156, 164, 172, 180, 189,
	197, 205, 213, 222, 230, 238,
	246, 255
]

export function formatRgb(rgb: Rgb): string {
	return rgb.join(',')
}

function getIndex(percentage: number): number {
	const index = percentageIndex.indexOf(percentage)

	if (index < 0){
		throw new Error('Invalid color index ! Something went wrong, please contact to admin.')
	}

	return index
}

export function pergentageToIndex(color: ColorPercentage): ColorIndex {
	return [getIndex(color[Red]), getIndex(color[Green]), getIndex(color[Blue])]
}

export function indexToPercentage(index: ColorIndex): ColorPercentage {
	return [percentageIndex[index[Red]], percentageIndex[index[Green]], percentageIndex[index[Blue]]]
}

export function indexToRgb(index: ColorIndex): Rgb {
	return [rgbIndex[index[Red]], rgbIndex[index[Green]], rgbIndex[index[Blue]]]
}

/**
 * Blend flower color values (percentage -> index)
 */
function blendValues(values: number[]): number {

	function foldSum(arr: number[]): number {
		return arr.reduce((a, b) => a + b)
	}

	switch (values.length){
		case 0:
			return 0
		case 1:
			return getIndex(values[0])
		case 2:
			return (foldSum(values.map(getIndex)) * 33 / 64) | 0
		case 3:
			return (foldSum(values.map(getIndex)) * 34 / 99) | 0
		case 4:
			return (foldSum(values.map(getIndex)) * 33 / 128) | 0
		default:
			throw new Error('Invalid flowers count ! Some logic went wrong...')
	}
}

function blendFlowers(slots: FlowerSlot[]): ColorPercentage {
	const filledSlot = <Flower[]>slots.filter(slot => slot != null)

	const reds = filledSlot.map(s => s.color[Red])
	const greens = filledSlot.map(s => s.color[Green])
	const blues = filledSlot.map(s => s.color[Blue])

	return indexToPercentage([
		blendValues(reds),
		blendValues(greens),
		blendValues(blues)
	])
}

function bleachValue(value: number, bleach: number): number {
	if (bleach == 0){
		return value
	}

	const bleached = value + (bleach * 16)

	return bleached > 87 ? 87 : bleached
}

function bleachStain(color: ColorPercentage, bleach: number): ColorPercentage {
	return [
		bleachValue(color[Red], bleach),
		bleachValue(color[Green], bleach),
		bleachValue(color[Blue], bleach)
	]
}

export function combineStain(flowerSlot: FlowerSlot[], bleach: number): Rgb {
	return percentageToRgb(bleachStain(blendFlowers(flowerSlot), bleach))
}

export function rgbToPercentage(rgb: Rgb): ColorPercentage {
	return [
		((rgb[Red] / 2.55) | 0),
		((rgb[Green] / 2.55) | 0),
		((rgb[Blue] / 2.55) | 0)
	]
}

export function percentageToRgb(percentage: ColorPercentage): Rgb {
	return [
		(percentage[Red] * 2.55) | 0,
		(percentage[Green] * 2.55) | 0,
		(percentage[Blue] * 2.55) | 0
	]
}

export function rgbToHsv(rgb: Rgb): Hsv {
	const [red, green, blue] = rgb

	const max = Math.max(red, green, blue)
	const min = Math.min(red, green, blue)


	const hue = (min == max)
			? 0
		: (min == blue)
			? (60 * ((green - red) / (max - min)) + 60)
		: (min == red)
			? (60 * ((blue - green) / (max - min)) + 180)
			: (60 * ((red - blue) / (max - min)) + 300)

	const saturation = ((max - min) / max) * 100

	const value = (max / 2.55)

	return [hue | 0, saturation | 0, value | 0]
}

export function hsvToRgb(hsv: Hsv): Rgb {
	const [hue, saturation, value] = hsv

	const max = (value * 2.55) | 0

	const min = (max - ((saturation / 100) * max)) | 0

	if (hue < 60){
		return [max, ((hue / 60) * (max - min) + min) | 0, min]
	} else if (hue < 120){
		return [(((120 - hue) / 60) * (max - min) + min) | 0, max, min]
	} else if (hue < 180){
		return [min, max, (((hue - 120) / 60) * (max - min) + min) | 0]
	} else if (hue < 240){
		return [min, (((240 - hue) / 60) * (max - min) + min) | 0, max]
	} else if (hue < 300){
		return [(((hue - 240) / 60) * (max - min) + min) | 0, min, max]
	} else {
		return [max, min, (((360 - hue) / 60) * (max - min) + min) | 0]
	}
}
