<!--
 * Index.vue
 * Created on Thu Oct 08 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
-->
<template>
	<div class="tutorial-container">
		<div class="tutorial-select-wrapper">
			<v-row
				class="tutorial-select"
				align="center"
				v-for="(item) of selectItem"
				:key="item.text"
				@click="clickItem(item)">
				<v-col cols="12" class="pa-0">
					<div class="tutorial-select-item-before"></div>
					<div class="tutorial-select-item">
						<span class="mx-auto white--text" v-html="item.text"></span>
					</div>
					<div class="tutorial-select-item-after"></div>
				</v-col>
			</v-row>
		</div>
		<div class="tutorial-textbox">
			<div class="tutorial-namebox-wrapper">
				<div class="tutorial-namebox text-title font-weight-bold">
					{{ author }}
				</div>
			</div>
			<div class="tutorial-textarea" @click="nextTextTrigger">
				{{ text }}
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { stepHello } from './tutorials';

@Component
export default class Tutorials extends Mixins(GlobalMixins) {
	//public step: any = stepHello.apply(this);
	public stepCaller: any = stepHello.bind(this);
	public current: any;
	public idx: number = -1;
	public selectItem: any[] = [];
	public textEffectTout!: NodeJS.Timer;
	public text: string = '';
	public triggerTextDone: number = 0;
	public author: string = '';
	public printSpeed: number = 100;

	public get step() {
		return stepHello();
	}

	public created() {
		if ( this.$cfg.get('tutorial') ) {
			return;
		}
		this.next();
	}

	public next() {
		this.idx += 1;
		this.current = this.step[this.idx];
		this.play();
	}

	public async play() {
		switch ( this.current.type ) {
			case 'speech':
				this.clearText();
				this.author = this.current.author;
				this.printText(this.current.text);
				break;
			case 'select':
				this.selectItem = this.current.items;
				break;
			case 'run':
				await this.current.callback.apply(this);
				break;
		}
	}

	public nextTextTrigger() {
		if ( this.current.type !== 'speech' ) {
			return;
		}
		switch ( this.triggerTextDone ) {
			case 0:
				this.triggerTextDone = 1;
				break;
			case 1:
				this.triggerTextDone = 0;
				this.next();
				break;
		}
	}

	public clearText() {
		if ( this.textEffectTout ) {
			clearTimeout(this.textEffectTout);
		}
		this.text = '';
	}

	public convertText(str: string) {
		return str.replace('\n', '<br>');
	}

	public printText(str: string) {
		const tmp = str.split('');
		const print = () => {
			if ( this.triggerTextDone === 1 ) {
				this.text += tmp.map((t) => this.convertText(t)).join('');
				return;
			}
			this.text += this.convertText(tmp.shift() as string);
			if ( !tmp.length ) {
				this.triggerTextDone = 1;
				return;
			}
			this.textEffectTout = setTimeout(print, this.printSpeed);
		};
		this.textEffectTout = setTimeout(print, this.printSpeed);
	}

	public async clickItem(item: any) {
		await item.callback.apply(this);
		this.selectItem = [];
		this.next();
	}
}
</script>
<style scope>
.tutorial-box {
	position: fixed;
	width: 200px;
	height: 200px;
	top: 50px;
	left:50px;
	box-shadow: 0 0 0 1000px rgba(0,0,0,.5);
  	box-shadow: 0 0 0 100vmax rgba(0,0,0,.3);
	pointer-events: none;
	z-index: 30;
}
.tutorial-container {
	user-select: none;
	position: fixed;
	width: 100vw;
	height: 100vh;
	z-index: 1000;
	background: rgba(0, 0, 0, 0.8);
}
.tutorial-namebox {
	margin-top: -40px;
	margin-left: 100px;
	font-size: 1.5rem;
	color: white;
	position: absolute;
}
.tutorial-namebox-wrapper {
	position: relative;
	background: rgb(255,255,255);
	background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
	width: 300px;
	height: 2px;
}
.tutorial-textbox {
	position: fixed;
	bottom: 0;
	width: 100vw;
	height: 230px;
	background: linear-gradient(0deg, rgba(0, 6, 94, 0.635) 0%, rgba(255,255,255,0) 100%);
}
.tutorial-textarea {
	padding: 3rem 2rem;
	font-size: 1.2rem;
	color: white;
	word-wrap: break-word;
	cursor: default;
}
.tutorial-select-wrapper {
	position: relative;
	display: table-cell;
	vertical-align: middle;
	width: 100vw;
	height: calc(100vh - 280px);
}
.tutorial-select {
	height: 50px;
	position: relative;
	vertical-align: middle;
	margin: 0;
	cursor: pointer;
	margin-bottom: 2rem;
	background: linear-gradient(90deg, rgba(0,12,89,0.30155812324929976) 0%, rgba(2,0,78,0.80015756302521) 50%, rgba(0,12,89,0.30155812324929976) 100%);
	animation-name: select-item-animation;
	animation-duration: 1s;
	transition: background ease 1s;
}
.tutorial-select:hover {
	background: linear-gradient(90deg, rgba(0,12,89,0.3) 0%, rgba(125,127,207,0.5) 50%, rgba(0,12,89,0.3) 100%);
	transition: background ease 1s;
}
.tutorial-select-item {
	height: 100%;
	vertical-align: middle;
	display: flex;
}
.tutorial-select-item-before {
	width: 100%;
	height: 1px;
	position: absolute;
	top: 0px;
	background: rgb(255,255,255);
	background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
	animation-name: select-item-animation-before;
	animation-duration: 2s;
}
.tutorial-select-item-after {
	width: 100%;
	height: 1px;
	position: absolute;
	bottom: 0px;
	background: rgb(255,255,255);
	background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
	animation-name: select-item-animation-after;
	animation-duration: 2s;
}
@keyframes select-item-animation-before {
	0% {
		left: 100%;
	}

	50% {
		left: 5%;
	}

	65% {
		left: 0%;
	}
}
@keyframes select-item-animation-after {
	0% {
		right: 100%;
	}

	50% {
		right: 5%;
	}

	65% {
		right: 0%;
	}
}
@keyframes select-item-animation {
	0% {
		opacity: 0;
	}

	100% {
		opacity: 1;
	}
}
</style>
