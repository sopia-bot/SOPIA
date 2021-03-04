<!--
 * App.vue
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-app style="padding-left: 56px">
		<!-- S: Login Dialog -->
		<v-dialog
			v-model="loginDialog"
			persistent
			max-width="450px"
			width="80%">
			<v-card>
				<v-row class="ma-0">
					<v-col cols="12" align="center">
						<v-card-title class="text-center d-block">
							{{ $t('app.login.title') }}
						</v-card-title>
						<v-card-text>
							<v-text-field
								:label="$t('app.login.id')"
								v-model="sopiaAuth.id"
								color="indigo"
								prepend-icon="mdi-account"
								type="text"
								></v-text-field>

							<v-text-field
								:label="$t('app.login.password')"
								v-model="sopiaAuth.pw"
								color="indigo"
								prepend-icon="mdi-lock"
								type="password"
								></v-text-field>
							<v-btn
								block dark
								tile
								@click="loginSopia"
								color="indigo darken-3">{{ $t('login') }}</v-btn>
						</v-card-text>
					</v-col>
				</v-row>
			</v-card>
		</v-dialog>
		<!-- E: Login Dialog -->
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
import CfgLite from '@/plugins/cfg-lite-ipc';
import { SopiaAPI } from '@/plugins/sopia-api';

declare global {
	interface Window {
		user: User;
		$spoon: any;
		$sopia: Client;
		reloadCfg: () => void;
		appCfg: CfgLite;
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
	public loginDialog: boolean = false;

	public sopiaAuth = {
		id: '',
		pw: '',
	};

	public async mounted() {
		const auth = this.$cfg.get('auth');

		if ( auth ) {
		} else {
			this.loginDialog = true;
		}

		this.$evt.$on('live-join', async (live: Play) => {
			this.currentLive = {} as Play;
			this.$nextTick(async () => {
				live = await this.$sopia.liveManager.liveInfo(live);
				this.currentLive = live;
			});
		});
	}

	public async loginSopia() {
		const res = await this.$api.login(this.sopiaAuth.id, this.sopiaAuth.pw);
		console.log(res);
	}

	public async spoonLogin(id: string, pw: string ) {
		window.user = await this.$sopia.login(id, pw, LoginType.PHONE);
		this.$evt.$emit('user', window.user);
	}

}
</script>
