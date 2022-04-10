<template>
	<div style="height: 64px" class="sopia-sidemenu-item" :class="active ? 'active' : ''" @click="$assign(href)">
		<v-row class="ma-2" style="height: 100%; position: relative;" align="center">
			<v-col cols="12" class="pa-0" align="center">
				<v-icon>{{ active ? activeIcon : icon }}</v-icon>
				<p v-show="!active" class="ma-0 text-caption font-weight-thin" style="font-size: 0.6rem !important;">{{ label }}</p>
			</v-col>
			<div v-show="active" class="selected-sidebar"></div>
		</v-row>
	</div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

@Component
export default class SideMenuItem extends Mixins(GlobalMixins) {
	@Prop(Boolean) public active!: boolean;
	@Prop(String) public label!: string;
	@Prop(String) public icon!: string;
	@Prop(String) public activeIcon!: string;
	@Prop(String) public href!: string;
}
</script>
<style scoped>
.sopia-sidemenu-item {
	display: block;
	cursor: pointer;
}
.sopia-sidemenu-item .selected-sidebar {
	position: absolute;
	left: 0;
	background-color: black;
	height: 30px;
	width: 5px;
	border-radius: 5px;
}
.sopia-sidemenu-item .row {
	border-radius: 5px;
}
.sopia-sidemenu-item.active .row {
	background-color: white;
}
.sopia-sidemenu-item .row:hover {
	background-color: #eaeaea;
}
.sopia-sidemenu-item .col,
.sopia-sidemenu-item .col i {
	color: #afafaf;
}
.sopia-sidemenu-item.active .col,
.sopia-sidemenu-item.active .col i,
.sopia-sidemenu-item:hover .col,
.sopia-sidemenu-item:hover .col i {
	color: #000;
}
</style>
