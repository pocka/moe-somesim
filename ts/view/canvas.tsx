import { ItemData } from '../types/item'

import { Rgb } from '../types/color'

interface Props {
	item: ItemData
	color: Rgb
}

function getCanvasContext(id: string): CanvasRenderingContext2D {
	return (document.getElementById(id) as HTMLCanvasElement).getContext('2d')
}

const CanvasCreator = () => {

	let basePixels: Uint8ClampedArray;
	let maskPixels: Uint8ClampedArray;

	function getBasePixels(): void {
		basePixels = getCanvasContext('base-canvas').getImageData(0, 0, 400, 400).data
	}

	function getMaskPixels(): void {
		maskPixels = getCanvasContext('mask-canvas').getImageData(0, 0, 400, 400).data
	}

	function blend(stainColor: Rgb): void {
		const dist = getCanvasContext('view-canvas')

		const distImage = new ImageData(400, 400)

		for (let i = 0, l = maskPixels.length; i < l; i += 4){
			const red = i
			const green = i + 1
			const blue = i + 2

			if (maskPixels[i] == 0){
				distImage.data[red] = basePixels[red]
				distImage.data[green] = basePixels[green]
				distImage.data[blue] = basePixels[blue]
			} else {
				const power = maskPixels[i] / 255

				distImage.data[red] = Math.floor(stainColor[0] * power) + basePixels[red]
				distImage.data[green] = Math.floor(stainColor[1] * power) + basePixels[green]
				distImage.data[blue] = Math.floor(stainColor[2] * power) + basePixels[blue]
			}

			distImage.data[i + 3] = 255
		}

		dist.putImageData(distImage, 0, 0, 0, 0, 400, 400)
	}

	return {
		render({ props }): deku.VirtualElement {
			const { item, color } = props as Props

			const updateCanvas = canvasType => () => {
				const ctx = getCanvasContext(`${ canvasType }-canvas`)

				ctx.drawImage(document.getElementById(`${ canvasType }-img`) as HTMLImageElement, 0, 0, 400, 400)

				getBasePixels()
				getMaskPixels()

				blend(color)
			}

			return (
				<div class="canvas-wrapper">
					<img id="base-img" class="canvas-source" src={ item.baseUri } onLoad={ updateCanvas('base') } />
					<br/>
					<img id="mask-img" class="canvas-source" src={ item.maskUri } onLoad={ updateCanvas('mask') } />
					<br/>
					<canvas id="base-canvas" class="canvas-hidden" width="400" height="400"></canvas>
					<canvas id="mask-canvas" class="canvas-hidden" width="400" height="400"></canvas>
					<canvas id="view-canvas" class="canvas-main" width="400" height="400"></canvas>
				</div>
			)
		},

		onCreate(): any {
			requestAnimationFrame(() => {
				getBasePixels()
				getMaskPixels()
			})
		},

		onUpdate({ props }): any {
			const { color } = props as Props

			blend(color)
		}
	}
}

export default CanvasCreator
