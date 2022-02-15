<template>
	<v-btn
		tile dark fixed
		color="indigo darken-4"
		class="side-menu-btn"
		ref="menu"
		:style="{ left, top, }"
		@mouseover="hover"
		@mousedown="mousedown"
		@mousemove="mousemove"
		@mouseup="mouseup">
		Menu
	</v-btn>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

@Component
export default class SideMenuRemocon extends Mixins(GlobalMixins) {
	/* close: -32px, open 256px - 32px */
	public closedLeft: number = -32;
	public sideWidth: number = 256;
	public defaultTop: string = 'calc(100vh / 2 - (32px))';
	public setTop: number = -1;

	private trigger = false;
	private beforeEvt!: MouseEvent;

	get left() {
		return this.$store.state.sideopen ?
			`${this.sideWidth + this.closedLeft}px` :
			`${this.closedLeft}px`;
	}

	get top() {
		if ( this.setTop >= 0 ) {
			return `${this.setTop}px`;
		}
		return this.defaultTop;
	}

	public mounted() {
		this.setTop = this.$cfg.get('menu-top') ?? -1;
	}

	public hover() {
		this.$store.state.sideopen = true;
	}

	public mousedown() {
		this.trigger = true;
	}

	public mousemove(evt: MouseEvent) {
		if ( this.trigger ) {
			if ( this.beforeEvt ) {
				const rect = (this.$refs.menu as Vue)?.$el.getBoundingClientRect();
				if ( rect.y <= 0 && (evt.y <= this.beforeEvt.y) ) {
					return;
				}

				if ( (rect.y + rect.height) >= window.innerHeight && (evt.y >= this.beforeEvt.y) ) {
					return;
				}
			}
			this.setTop = evt.y;
			this.beforeEvt = evt;
		}
	}

	public mouseup() {
		this.$cfg.set('menu-top', this.setTop);
		this.$cfg.save();
		this.trigger = false;
	}
}
</script>
<style>
.side-menu-btn {
	transform: rotate(90deg);
	z-index: 10;
	width: 100px;
	
	transition-property: left;
}
</style>