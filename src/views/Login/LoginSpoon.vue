<!--
 * LoginSpoon.vue
 * Created on Fri Jul 02 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
-->
<template>
	<div>
		<v-tabs
	  		v-model="tab"
	 		color="indigo"
	 		grow>
			<v-tab
	   			v-for="item in tabItem"
	   			:key="item">
				{{ $t('app.login.' + item) }}
			</v-tab>
		</v-tabs>
		<v-card-text>
			<v-text-field
				:label="$t('app.login.spoon-id')"
				v-model="auth.id"
				color="indigo"
				prepend-icon="mdi-account"
				type="text"
				></v-text-field>

			<v-text-field
				:label="$t('app.login.spoon-password')"
				v-model="auth.pw"
				color="indigo"
				prepend-icon="mdi-lock"
				type="password"
				></v-text-field>

			<p class="red--text">{{ errorMsg }}</p>

			<v-btn
				block dark
				tile text
				@click="loginSpoon"
				color="indigo darken-3">{{ $t('login') }}</v-btn>

			<v-btn
				block dark
				tile depressed
	   			style="background-color: #4867AA;"
				@click="snsLoginSpoon('facebook')"
				color="lighten-1">FACEBOOK</v-btn>

			<v-btn
				block dark
				tile text
				@click="snsLoginSpoon('google')"
				color="black">GOOGLE</v-btn>

			<v-btn
				block dark
				tile depressed
				@click="snsLoginSpoon('apple')"
				color="black darken-3">APPLE</v-btn>
		</v-card-text>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { SnsType } from '@sopia-bot/core';
const { remote } = window.require('electron');

@Component
export default class LoginSpoon extends Mixins(GlobalMixins) {

	public tabItem: SnsType[] = [ SnsType.PHONE, SnsType.EMAIL ];
	public tab: number = 0;
	public auth = { id: '', pw: '' };
	public errorMsg: string = '';

	public get snsType() {
		return this.tabItem[this.tab] || this.tabItem[0];
	}

	public async loginSpoon() {
		try {
			const user = await this.$sopia.login(this.auth.id, this.auth.pw, this.snsType);
			this.$emit('logon', user);
		} catch ( err ) {
			this.errorMsg = this.$t('app.login.login-fail');
		}
	}

	public async snsLoginSpoon(snsType: SnsType) {
		const snsLoginOpen = remote.getGlobal('snsLoginOpen');
		try {
			let user: any = await snsLoginOpen(this.$sopia.snsLoginURL(snsType));
			user = await this.$sopia.loginToken(user.id, user.token.replace('Bearer ', ''), user.refresh_token);
			this.$emit('logon', user);
		} catch {
			this.errorMsg = this.$t('app.login.login-fail');
		}
	}

}
</script>
