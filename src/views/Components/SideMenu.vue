<template>
	<v-navigation-drawer
		app permanent floating
		v-model="open"
		mini-variant
		mini-variant-width="80"
		class="grey lighten-4"
		style="margin-top: 48px;">
		<side-menu-item
			v-for="(menu, idx) of menuItems"
			:key="menu.href"
			:label="menu.label"
			:active="menu.isActive(menu.href)"
			:icon="menu.icon"
			:active-icon="menu.activeIcon"
			:href="menu.href"></side-menu-item>
		<side-menu-item style="margin-top: auto; bottom: 0;"></side-menu-item>
	</v-navigation-drawer>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import SideMenuItem from './SideMenuItem.vue';

@Component({
	components: {
		SideMenuItem,
	},
})
export default class SideMenu extends Mixins(GlobalMixins) {
	public open = true;

	public menuItems: any[] = [
		{
			href: '/',
			label: this.$t('page.Home'),
			icon: 'mdi-home-outline',
			activeIcon: 'mdi-home',
			isActive: this.isActive.bind(this),
		},
		{
			href: '/cmd/join',
			label: this.$t('page.Command'),
			icon: 'mdi-robot-happy',
			activeIcon: 'mdi-robot-happy-outline',
			isActive: this.isActive.bind(this),
		},
		{
			href: '/bundle/store',
			label: this.$t('page.store'),
			icon: 'mdi-store-outline',
			activeIcon: 'mdi-store',
			isActive: this.isActive.bind(this),
		},
	];

	public isActive(href: string): boolean {
		return this.$route.path === href;
	}
}
</script>
<style>
</style>
