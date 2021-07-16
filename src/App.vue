<!--
 * App.vue
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-app style="padding-left: 56px">
		<login-dialog v-model="loginDialog" />
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
import { User, Live, SpoonClient } from '@sopia-bot/core';
import CfgLite from '@/plugins/cfg-lite-ipc';
import { SopiaAPI } from '@/plugins/sopia-api';

import SideMenu from '@/views/SideMenu/Index.vue';
import LivePlayer from '@/views/Live/Player.vue';
import LoginDialog from '@/views/Login/Index.vue';

declare global {
	interface Window {
		user: User;
		$spoon: any;
		$sopia: SpoonClient;
		reloadCfg: () => void;
		appCfg: CfgLite;
	}
}

@Component({
	components: {
		SideMenu,
		LivePlayer,
		LoginDialog,
	},
})
export default class App extends Mixins(GlobalMixins) {
	public currentLive: Live = {} as Live;
	public loginDialog: boolean = false;

	public mounted() {
		const auth = this.$cfg.get('auth');

		if ( auth ) {
			this.$api.user = auth.sopia;
			this.$sopia.loginToken(auth.spoon.id, auth.spoon.token, auth.spoon.refresh_token)
				.then((user) => {
					this.$evt.$emit('user', user);
				});
		} else {
			this.loginDialog = true;
		}

		this.$evt.$on('live-join', async (live: number) => {
			const req = await this.$sopia.api.lives.info(live);
			this.$nextTick(async () => {
				this.currentLive = req.res.results[0];
			});
		});
	}

}
</script>
