import { Action as ActionInterface } from 'redux'

import { Rgb, Hsv } from '../types/color'
import { FlowerSlot } from '../types/flower'

namespace Stain {
	interface ColorAction extends ActionInterface {
		color: Rgb
	}

	interface HsvAction extends ActionInterface {
		hsv: Hsv
	}

	interface FlowerSlotAction extends ActionInterface {
		slot?: number,
		flower?: any
	}

	interface BleachAction extends ActionInterface {
		bleach?: number
	}

	interface EmptyAction extends ActionInterface {
	}

	export interface Action extends ColorAction, HsvAction, FlowerSlotAction, BleachAction {}

	export namespace Types {
		export const SetColor = 'STAIN.SETCOLOR'
		export const SetHsv = 'STAIN.SETHSV'
		export const RefreshColor = 'STAIN.REFRESHCOLOR'
		export const SetSlot = 'STAIN.SETSLOT'
		export const ClearSlot = 'STAIN.CLEARSLOT'
		export const ClearAllSlots = 'STAIN.CLEARALLSLOTS'
		export const Bleach = 'STAIN.BLEACH'
		export const UnBleach = 'STAIN.UNBLEACH'
		export const SetBleach = 'STAIN.SETBLEACH'
	}

	export function SetColor(color: Rgb): ColorAction {
		return { type: Types.SetColor, color }
	}

	export function SetHsv(hsv: Hsv): HsvAction {
		return { type: Types.SetHsv, hsv }
	}

	export function RefreshColor(): EmptyAction {
		return { type: Types.RefreshColor }
	}

	export function SetSlot(slot: number, flower: FlowerSlot): FlowerSlotAction {
		return { type: Types.SetSlot, slot, flower }
	}

	export function ClearSlot(slot: number): FlowerSlotAction {
		return { type: Types.ClearSlot, slot }
	}

	export function ClearAllSlots(): FlowerSlotAction {
		return { type: Types.ClearAllSlots }
	}

	export function Bleach(): BleachAction {
		return { type: Types.Bleach }
	}

	export function UnBleach(): BleachAction {
		return { type: Types.UnBleach }
	}

	export function SetBleach(bleach: number): BleachAction {
		return { type: Types.SetBleach, bleach }
	}
}

export default Stain
