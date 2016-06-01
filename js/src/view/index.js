import {element,createApp} from 'deku';
import {match} from 'rusted';

import {
	Tab,TabItem,
	TabNav,TabNavItem
} from 'hojicha/lib/deku';

// common components
import Preview from './ColorPreview';
import Slider from './ColorSliders';

// unique components
import Stain from './Stain';
import URIBox from './URIBox';
import ControlPanel from './ControlPanel';
import EquipPanel from './EquipPanel';
import ColorPallet from './ColorPallet';
import FlowerSlot from './FlowerSlot';
import {Layer,Controller as LayerController} from './Layer';
import Information from './Information';

// stores
import FlowerStore from '../store/flower';
import ColorStore from '../store/color';
import {ControlMode,ControlStore} from '../store/control-mode';
import EquipStore from '../store/equip';
import StainStore from '../store/stain';
import ExternalDocStore from '../store/external-doc';

// actions
import {
	Action
}	from '../actions/';

// dispatcher
import {dispatch,register} from '../dispatcher';

// structs
import Color from '../structs/color';

import meta from '../meta';

let isLandscape=(window.innerHeight>window.innerWidth)?false:true;

let getState=()=>{
	return {
		flower_list:FlowerStore.list,
		flower_slot:FlowerStore.slot,
		selected_flower_slot:FlowerStore.selected_slot,
		color:ColorStore.color,
		mode:ControlStore.mode,
		items:EquipStore.list,
		pallet:StainStore.list,
		readme:ExternalDocStore.readme,
		update:ExternalDocStore.update
	};
};

let App=({props,dispatch})=>{
	let {state}=props;
	return (
		<div class="app-container">
			<div class="somesim--float-panel">
				<LayerController name='readme'>
					<span class="icon icon-question"></span>
				</LayerController>
				<LayerController name='info'>
					<span class="icon icon-info"></span>
				</LayerController>
				<LayerController name='update'>
					<span class="icon icon-book"></span>
				</LayerController>
			</div>
			<Layer name='info'>
				{ Information }
			</Layer>
			<Layer name='readme'>
				<div innerHTML={
					match(state.readme,{
						Some:html=>html,
						None:()=><p>読込中です...</p>
					})
				}></div>
			</Layer>
			<Layer name='update'>
				<div innerHTML={
					match(state.update,{
						Some:html=>html,
						None:()=><p>読込中です...</p>
					})
				}></div>
			</Layer>
			<div class="main-container">
				<div class="title-container">
				<h1 class="title">MoEそめしむ</h1>
				<p class="app-version">ver.{props.version}</p>
				</div>
				<div id="canvas-wrapper" class="canvas-container">
					<canvas id="canvas"/>
					<canvas class="nodisp" id="canvas_result_alpha"/>
					<canvas class="nodisp" id="canvas_result_texture"/>
					<Preview color={state.color}/>
				</div>
				<div class="control-container">
					<TabNav name="main">
						<TabNavItem name="flower" group="main" default={
							match(state.mode,{
								Flower:true,
								_:false
							})
						} onClick={
							()=>{dispatch(Action.ChangeControlMode(ControlMode.Flower))}
						}>
							染色液を作る
						</TabNavItem>
						<TabNavItem name="color" group="main" default={
							match(state.mode,{
								Color:true,
								_:false
							})
						} onClick={
							()=>{dispatch(Action.ChangeControlMode(ControlMode.Color))}
						}>
							色をつくる
						</TabNavItem>
						<TabNavItem name="pallet" group="main" default={
							match(state.mode,{
								Pallet:true,
								_:false
							})
						} onClick={
							()=>{dispatch(Action.ChangeControlMode(ControlMode.Pallet))}
						}>
							パレット
						</TabNavItem>
						<TabNavItem name="equip" group="main" default={
							match(state.mode,{
								Equip:true,
								_:false
							})
						} onClick={
							()=>{dispatch(Action.ChangeControlMode(ControlMode.Equip))}
						}>
							装備を選ぶ
						</TabNavItem>
					</TabNav>
					<div class="control-contents">
						<ControlPanel visible={match(state.mode,{Color:true,_:false})}>
							<h4>RGB/HSV</h4>
							<Slider rgb={state.color} hsv={state.color.to_hsv()} onChange={
								val=>{
									dispatch(Action.SelectColor(val));
								}
							}/>
						</ControlPanel>
						<ControlPanel visible={match(state.mode,{Flower:true,_:false})}>
							<FlowerSlot slots={state.flower_slot} selected={state.selected_flower_slot}/>
							<div class="flower--list--container">
								{
									match(state.flower_list,{
										Some:list=>{
											return list.map(gener=>{
												return (
													<div>
														<h4>{gener.name}</h4>
														<ColorPallet list={gener.list} onChange={
															(v)=>{dispatch(Action.SelectFlower(v))}
														}/>
													</div>
												);
											});
										},
										None:()=>{
											return <p>リストが読み込まれていません</p>
										}
									})
								}
							</div>
						</ControlPanel>
						<ControlPanel visible={match(state.mode,{Pallet:true,_:false})}>
							<h4>{'（*>ω<）=3'}</h4>
							{
								match(state.pallet,{
									Some:list=>{
										return (
											<div class="color-pallet--container">
												<ColorPallet list={list}/>
											</div>
										);
									},
									None:()=>{
										return <p>パレットが読み込まれていません</p>
									}
								})
							}
						</ControlPanel>
						<ControlPanel visible={match(state.mode,{Equip:true,_:false})}>
							<EquipPanel list={state.items}/>
						</ControlPanel>
					</div>
				</div>
			</div>
		</div>
	);
};

let renderer=createApp(document.getElementById('view'),dispatch);

let render=()=>{
	renderer(<App version={meta.version} state={getState()}/>);
};

let hook=store=>{
	if (render) {
		render();
	}
};

[ExternalDocStore,FlowerStore,ColorStore,ControlStore,EquipStore,StainStore].forEach(store=>{
	store.observe(hook);
});

render();

export function destroy(){
	document.getElementById('view').innerHTML='';
	renderer=void 0;
	hook=void 0;
	render=void 0;
}
