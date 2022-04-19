<template>
	<v-navigation-drawer
		app permanent floating
		v-model="open"
		mini-variant
		mini-variant-width="80"
		class="grey lighten-4"
		style="margin-top: 48px; height: calc(100vh - 48px);">
		<side-menu-item
			v-for="(menu) of menuItems"
			:key="menu.href"
			:label="menu.label"
			:active="menu.isActive(menu.href)"
			:icon="menu.icon"
			:openNew="menu.openNew"
			:active-icon="menu.activeIcon"
			:href="menu.href"></side-menu-item>
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
			href: '/cmd/join/',
			label: this.$t('page.Command'),
			icon: 'mdi-robot-happy-outline',
			activeIcon: 'mdi-robot-happy',
			isActive: () => {
				return this.$route.path.startsWith('/cmd/');
			},
		},
		{
			href: '/code/',
			label: this.$t('page.Code'),
			icon: 'mdi-code-tags',
			activeIcon: 'mdi-code-tags-check',
			isActive: this.isActive.bind(this),
		},
		{
			href: '/bundle/store/',
			label: this.$t('page.store'),
			icon: 'mdi-bookshelf',
			activeIcon: 'mdi-book-open-variant',
			isActive: () => {
				return this.$route.path.startsWith('/bundle/');
			},
		},
		{
			href: 'https://github.com/sopia-bot/SOPIA',
			label: this.$t('page.github'),
			icon: 'mdi-github',
			activeIcon: 'mdi-github',
			openNew: true,
			isActive: () => false,
		},
	];

	public isActive(href: string): boolean {
		return this.$route.path === href;
	}
}
</script>
<style>
</style>
