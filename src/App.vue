<!--
 * App.vue
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-app style="">
		<login-dialog v-model="loginDialog"/>
		<bundle-update-dialog v-model="bundleUpdateDialogShow" :items="bundleUpdateList" />
		<side-menu />
		<side-menu-remocon/>
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
import path from 'path';
import { BundlePackage } from '@/interface/bundle';

import SideMenu from '@/views/SideMenu/Index.vue';
import LivePlayer from '@/views/Live/Player.vue';
import LoginDialog from '@/views/Login/Index.vue';
import BundleUpdateDialog from '@/views/Bundle/UpdateDialog.vue';
import SideMenuRemocon from '@/views/SideMenu/Remocon.vue';

const fs = window.require('fs');

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
		BundleUpdateDialog,
		SideMenuRemocon,
	},
})
export default class App extends Mixins(GlobalMixins) {
	public currentLive: Live = {} as Live;
	public loginDialog: boolean = false;
	public skipSopiaLogin: boolean = false;
	public bundleUpdateDialogShow: boolean = false;
	public bundleUpdateList: BundlePackage[] = [];

	public async mounted() {
		const auth = this.$cfg.get('auth');

		if ( auth && auth.sopia && auth.spoon ) {
			const res = await this.$api.req('GET', `/user/${auth.sopia.user_id}`);
			if ( res.error ) {
				this.$cfg.delete('auth');
				this.loginDialog = true;
			} else {
				this.$api.user = auth.sopia;
				this.$sopia.loginToken(auth.spoon.id, auth.spoon.token, auth.spoon.refresh_token)
					.then(async (user) => {
						const token = await this.$sopia.refreshToken(user.id, auth.spoon.token, auth.spoon.refresh_token);
						if ( token ) {
							auth.spoon.token = token;
							this.$evt.$emit('user', user);
							this.$cfg.set('auth.spoon.token', token);
							this.$cfg.save();

							await this.$api.activityLog('logon');
						} else {
							throw Error('Invalid token');
						}
					})
					.catch((err) => {
						this.$evt.$emit('login:skip-sopia-login', auth.sopia);
						this.loginDialog = true;
					});
			}
		} else {
			this.loginDialog = true;
		}

		this.$evt.$off('live-join');
		this.$evt.$on('live-join', async (live: number) => {
			const req = await this.$sopia.api.lives.info(live);
			this.$nextTick(async () => {
				this.currentLive = req.res.results[0];
				await this.$api.activityLog('live-join', req.res.results[0].id.toString());
			});
		});

		this.$evt.$off('live-leave');
		this.$evt.$on('live-leave', () => {
			this.currentLive = {} as Live;
		});


		if ( !this.loginDialog ) {
			this.checkBundleUpldate();
		}
	}

	public async checkBundleUpldate() {
		const bundleDirectory = this.$path('userData', 'bundles');
		const updateRequest = fs.readdirSync(bundleDirectory)
			.filter((item: string) => fs.lstatSync(path.join(bundleDirectory, item)).isDirectory())
			.map((item: string) => this.$api.req('GET', `/bundle/${item}`));

		const bundleInfoList = (await Promise.all(updateRequest) as any[])
			.filter((res) => !res.error)
			.map((res) => res.data[0])
			.filter((bundle) => {
				const pkgPath = path.join(bundleDirectory, bundle.name, 'package.json');
				const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
				return pkg.version !== bundle.version;
			});

		if ( bundleInfoList.length > 0 ) {
			this.bundleUpdateList = bundleInfoList;
			this.bundleUpdateDialogShow = true;
		}
	}

}
</script>
