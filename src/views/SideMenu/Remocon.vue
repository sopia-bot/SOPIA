<template>
	<v-btn
		tile dark fixed
		color="indigo darken-4"
		class="side-menu-btn"
		:style="{ left, }"
		@mouseover="hover">
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

	get left() {
		return this.$store.state.sideopen ?
			`${this.sideWidth + this.closedLeft}px` :
			`${this.closedLeft}px`;
	}

	public hover() {
		console.log('call hover');
		this.$store.state.sideopen = true;
	}
}
</script>
<style>
.side-menu-btn {
	transform: rotate(90deg);
	z-index: 10;
	width: 100px;
	top: calc(100vh / 2 - (32px));
	transition-property: left;
}
</style>