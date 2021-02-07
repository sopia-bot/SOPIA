<!--
 * App.vue
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-app style="padding-left: 56px">
		<side-menu />
		<v-sheet id="router-view" tile :key="$route.fullPath">
			<transition name="scroll-y-reverse-transition">
				<router-view />
			</transition>
		</v-sheet>
		<live-player v-if="currentLive.id" :live="currentLive" />
	</v-app>
</template>
<style>
.h-100v {
	height: 100vh;
}
html, body {
	overflow: hidden;
}
</style>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import SideMenu from '@/views/SideMenu/Index.vue';
import { LoginType, User, Play, Client } from 'sopia-core';
import LivePlayer from '@/views/Live/Player.vue';

declare global {
	interface Window {
		user: User;
		$spoon: any;
		$sopia: Client;
	}
}

@Component({
	'components': {
		SideMenu,
		LivePlayer,
	},
})
export default class App extends Mixins(GlobalMixins) {
	public currentLive: Play = {} as Play;

	public async mounted() {
		window.user = await this.$sopia.login(localStorage.id, localStorage.pw, LoginType.PHONE);
		this.$evt.$emit('user', window.user);
		this.$evt.$on('live-join', async (live: Play) => {
			this.currentLive = {} as Play;
			this.$nextTick(async () => {
				live = await this.$sopia.liveManager.liveInfo(live);
				this.currentLive = live;
			});
		});
	}
}
</script>
