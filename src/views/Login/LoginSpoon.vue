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
	 		color="red"
			class="px-14"
	 		grow>
			<v-tab
	   			v-for="item in tabItem"
	   			:key="item">
				{{ $t('app.login.' + item) }}
			</v-tab>
		</v-tabs>
		<v-card-text class="px-14">
			<v-text-field
				:label="$t('app.login.spoon-id')"
				v-model="auth.id"
				color="red darken-1"
				prepend-icon="mdi-account"
				type="text"
				></v-text-field>

			<v-text-field
				:label="$t('app.login.spoon-password')"
				v-model="auth.pw"
				color="red darken-1"
				prepend-icon="mdi-lock"
				type="password"
				></v-text-field>

			<p class="red--text ma-0 mb-3">{{ errorMsg }}</p>

			<v-btn
				block dark
				text
				@click="loginSpoon"
				style="background: #FE4101;"
				rounded large
				:elevation="3"
				color="white">{{ $t('login') }}</v-btn>

			<v-btn
					block dark
					text tile large
					class="mt-4"
					:elevation="3"
					@click="snsLoginSpoon('google')"
					color="black">
				<img src="../../assets/google.png" width="25px" alt="">
				<v-spacer></v-spacer>
				<span class="font-weight-light">{{ $t('app.login.google') }}</span>
				<v-spacer></v-spacer>
			</v-btn>

			<v-btn
				block dark
				tile depressed
				style="background-color: #475993;"
				large
				class="mt-2"
				:elevation="3"
				@click="snsLoginSpoon('facebook')">
				<div style="background: white; width: 20px; height: 25px;">
					<img src="../../assets/facebook.png" width="25px" alt="" style="margin-left: -3px;">
				</div>
				<v-spacer></v-spacer>
				{{ $t('app.login.facebook') }}
				<v-spacer></v-spacer>
			</v-btn>

			<v-btn
				block dark
				tile depressed
				large
				class="mt-2"
				:elevation="3"
				@click="snsLoginSpoon('apple')"
				color="black darken-3">
				<img src="../../assets/apple.png" width="25px" alt="">
				<v-spacer></v-spacer>
				{{ $t('app.login.apple') }}
				<v-spacer></v-spacer>
			</v-btn>
		</v-card-text>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { SnsType, LogonUser } from '@sopia-bot/core';
import { snsLoginOpen } from '@/plugins/ipc-renderer';

@Component
export default class LoginSpoon extends Mixins(GlobalMixins) {

	public tabItem: SnsType[] = [ SnsType.PHONE, SnsType.EMAIL ];
	public tab: number = 0;
	public auth: any = { id: '', pw: '' };
	public errorMsg: string = '';

	public get snsType() {
		return this.tabItem[this.tab] || this.tabItem[0];
	}

	public async loginSpoon() {
		try {
			if ( this.snsType === SnsType.PHONE ) {
				this.auth.id = +this.auth.id || '';
			}
			const user = await this.$sopia.login(this.auth.id, this.auth.pw, this.snsType);
			this.$emit('logon', user);
		} catch ( err ) {
			this.errorMsg = this.$t('app.login.login-fail');
		}
	}

	public async snsLoginSpoon(snsType: SnsType) {
		try {
			let user: any = await snsLoginOpen(this.$sopia.snsLoginURL(snsType));
			user = await this.$sopia.loginToken(user.id, user.token.replace('Bearer ', ''), user.refresh_token);
			this.$emit('logon', user as LogonUser);
		} catch {
			this.errorMsg = this.$t('app.login.login-fail');
		}
	}

}
</script>
