import { h } from 'deku'

import { Tab, TabItem } from './tab'
import Panel from './panel'
import PalletList from './pallet-list'
import ItemList from './item-list'
import ColorPreview from './color-preview'
import FlowerList from './flower-list'
import FlowerSlotManager from './flower-slot-manager'

import CanvasCreator from './canvas'

const Canvas = CanvasCreator()


const Section = ({ children }) => {
	return <div class="section">{ children }</div>
}

export default ({ props }) => {
	return (
		<div class="panel-container">
			<input type="radio" name="panel-state" checked="true" id="panel-state-main" class="panel-state panel-state-main"/>
			<input type="radio" name="panel-state" id="panel-state-color" class="panel-state panel-state-color"/>
			<input type="radio" name="panel-state" id="panel-state-item" class="panel-state panel-state-item"/>
			<label class="panel-state-controller panel-state-controller-main" for="panel-state-main" title="メイン画面を表示"></label>
			<label class="panel-state-controller panel-state-controller-color" for="panel-state-color" title="色管理画面を表示"></label>
			<label class="panel-state-controller panel-state-controller-item" for="panel-state-item" title="装備選択画面を表示"></label>

			<Panel class="panel-item panel-side">
				<ItemList items={ props.item.list } selected={ props.item.selected }/>
			</Panel>
			<Panel class="panel-main">
				{
					h(Canvas, {
						item: props.item.selected,
						color: props.stain.rgb,
						loading: props.isLoading
					})
				}
			</Panel>
			<Panel class="panel-color panel-side">
				<Section>
					<ColorPreview color={ props.stain.rgb } hsv={ props.stain.hsv } />
				</Section>
				<Tab>
					<TabItem title="花びら" default={ true } group="color" class="tab-flower">
						<p class="note-text">花びらをスロットにD&Dしてね</p>
						<FlowerSlotManager slots={ props.stain.flowerSlot } bleach={ props.stain.bleach } />
						<FlowerList list={ props.flowerList } slots={ props.stain.flowerSlot } />
					</TabItem>
					<TabItem title="パレット" group="color">
						<p class="note-text">パレットの色をクリックまたはタッチして色を選んでね</p>
						<PalletList pallets={ props.pallets } color={ props.stain.rgb } />
					</TabItem>
				</Tab>
			</Panel>
		</div>
	)
}
