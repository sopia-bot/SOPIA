<!--
 * App.vue
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-app style="">
		<title-bar />
		<update-dialog />
		<donation />
		<login-dialog v-if="$store.state.loginDialog" v-model="$store.state.loginDialog"/>
		<bundle-update-dialog v-model="bundleUpdateDialogShow" :items="bundleUpdateList" />
		<side-menu />
		<div class="ma-0 d-flex">
			<v-sheet id="router-view" tile :key="$route.fullPath" color="white" style="flex-basis: 80%; flex-grow: 1; flex-shrink: 1;">
				<transition name="scroll-y-reverse-transition">
					<router-view></router-view>
				</transition>
			</v-sheet>
			<live-player v-if="currentLive.id" :live="currentLive" />
		</div>
		<!--<tutorials/>-->
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

import LivePlayer from '@/views/Live/Player.vue';
import LoginDialog from '@/views/Login/Index.vue';
import BundleUpdateDialog from '@/views/Bundle/UpdateDialog.vue';
import UpdateDialog from '@/views/Components/UpdateDialog.vue';
import TitleBar from '@/views/Components/TitleBar.vue';
import SideMenu from '@/views/Components/SideMenu.vue';
import Tutorials from '@/views/Tutorials/Index.vue';
import Donation from '@/views/Components/Donation.vue';

const fs = window.require('fs');

declare global {
	interface Window {
		user: User;
		$spoon: any;
		$sopia: SpoonClient;
		reloadCfg: () => void;
		appCfg: CfgLite;
		logout: () => void;
	}
}

@Component({
	components: {
		SideMenu,
		LivePlayer,
		LoginDialog,
		BundleUpdateDialog,
		UpdateDialog,
		TitleBar,
		Tutorials,
		Donation,
	},
})
export default class App extends Mixins(GlobalMixins) {
	public currentLive: Live = {} as Live;
	public bundleUpdateDialogShow: boolean = false;
	public bundleUpdateList: BundlePackage[] = [];

	public enter(...args: any[]) {
		console.log('enter transition', args);
	}

	public async created() {
		const req = await this.$sopia.api.users.followings(4324890);
		this.$store.commit('partners', req.res.results);
	}

	public async mounted() {
		const auth = this.$cfg.get('auth');

		window.logout = () => {
			this.$cfg.delete('auth');
			this.$cfg.save();
			setTimeout(() => {
				window.location.reload();
			}, 100);
		};

		if ( auth && auth.sopia && auth.spoon ) {
			const res = await this.$api.req('GET', `/user/${auth.sopia.user_id}`);
			if ( res.error ) {
				this.$cfg.delete('auth');
				this.$store.state.loginDialog = true;
			} else {
				this.$api.user = auth.sopia;
				this.$sopia.loginToken(auth.spoon.id, auth.spoon.token, auth.spoon.refresh_token)
					.then(async (user) => {
						const token = await this.$sopia.refreshToken(user.id, auth.spoon.token, auth.spoon.refresh_token);
						if ( token ) {
							auth.spoon.token = token;
							this.$store.commit('user', user);
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
						this.$store.state.loginDialog = true;
					});
			}
		} else {
			this.$store.state.loginDialog = true;
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

		console.log('login dialog', this.$store.state.loginDialog);
		if ( !this.$store.state.loginDialog ) {
			this.checkBundleUpldate();
		}
	}

	public async checkBundleUpldate() {
		const bundleDirectory = this.$path('userData', 'bundles');
		const updateRequest = fs.readdirSync(bundleDirectory)
			.filter((item: string) => fs.lstatSync(path.join(bundleDirectory, item)).isDirectory())
			.map(async (item: string) => {
				try {
					return await this.$api.req('GET', `/bundle/${item}`)
				} catch {
					return;
				}
			});

		const bundleInfoList = (await Promise.all(updateRequest) as any[])
			.filter((res) => res && !res.error)
			.map((res) => res.data[0])
			.filter((bundle) => {
				const pkgPath = path.join(bundleDirectory, bundle.name, 'package.json');
				const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
				console.log(pkg.name, pkg.version, bundle.version);
				return pkg.version !== bundle.version;
			});

		if ( bundleInfoList.length > 0 ) {
			this.bundleUpdateList = bundleInfoList;
			this.bundleUpdateDialogShow = true;
		}
	}

}
</script>
<style lang="scss">
@font-face {
	font-family: JoyPixels;
	src: url('./assets/JoyPixels-SBIX.woff2') format('woff2');
	/* using the unicode-range attribute to limit the reach of the JoyPixels web font */
    unicode-range: U+00A9, U+00AE, U+203C, U+2049, U+20E3, U+2122, U+2139, U+2194-2199, U+21A9-21AA, U+231A, U+231B, U+2328, U+23CF, U+23E9-23F3, U+23F8-23FA, U+24C2, U+25AA, U+25AB, U+25B6, U+25C0, U+25FB-25FE, U+2600-27EF, U+2934, U+2935, U+2B00-2BFF, U+3030, U+303D, U+3297, U+3299, U+1F000-1F02F, U+1F0A0-1F0FF, U+1F100-1F64F, U+1F680-1F6FF, U+1F910-1F96B, U+1F980-1F9E0;
}
@font-face {
    font-family: 'GangwonEdu_OTFBoldA';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/GangwonEdu_OTFBoldA.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
.v-application {
   font-family: JoyPixels, sans-serif !important;
}
</style>