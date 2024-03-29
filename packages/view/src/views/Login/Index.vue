<!--
 * Index.vue
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<!-- S: Login Dialog -->
	<v-dialog
		v-model="value"
		persistent
		fullscreen
		max-width="450px"
		width="80%">
		<v-card>
			<v-row class="ma-0" style="height: 100vh;" align="center">
				<v-col cols="6" class="blue-grey lighten-5"  style="height: 100%;">
					<v-row style="height: 100%;" align="center">
						<v-col cols="12" class="text-center">
							<img alt="" src="../../assets/sopia-sd.png" style="width: 100%">
						</v-col>
					</v-row>
				</v-col>
				<v-col cols="6" align="center" transition="fade-transition">
					<login-sopia v-if="sopiaShow" @logon="sopiaLogon"/>
					<login-spoon v-if="spoonShow" @logon="spoonLogon"/>
				</v-col>
			</v-row>
		</v-card>
	</v-dialog>
	<!-- E: Login Dialog -->
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { UserDto } from '@sopia-bot/api-dto';
import { LogonUser } from '@sopia-bot/core';

import LoginSopia from '@/views/Login/LoginSopia.vue';
import LoginSpoon from '@/views/Login/LoginSpoon.vue';
import GlobalMixins from '@/plugins/mixins';

@Component({
	components: {
		LoginSopia,
		LoginSpoon,
	},
})
export default class Login extends Mixins(GlobalMixins) {

	@Prop(Boolean) public value!: boolean;
	public sopiaShow: boolean = true;
	public spoonShow: boolean = false;

	public sopiaUser!: UserDto;

	public created() {
		this.$evt.$on('login:skip-sopia-login', (user: UserDto) => {
			this.sopiaUser = user;
			this.sopiaShow = false;
			this.spoonShow = true;
		});
		const sopia = this.$cfg.get('auth.sopia');
		if ( sopia ) {
			this.$evt.$emit('login:skip-sopia-login', sopia);
		}
	}

	public beforeUnmount() {
		this.$evt.$off('login:skip-sopia-login');
	}

	public async sopiaLogon(user: UserDto) {
		this.sopiaUser = user;
		this.$cfg.set('sopia', this.sopiaUser);
		if ( this.sopiaUser.spoon_id === '0' ) {
			this.sopiaShow = false;
			this.spoonShow = true;
		} else {
			const { id, token, refresh_token } = this.$cfg.get('auth.spoon') || {};
			if ( !token || !refresh_token ) {
				this.sopiaShow = false;
				this.spoonShow = true;
			} else {
				await this.$sopia.loginToken(id, token, refresh_token);
				this.loginSpoon(this.$sopia.logonUser);
			}
		}
	}


	public async spoonLogon(user: LogonUser) {
		this.$logger.info('Spoon login user', user);
		this.sopiaUser.spoon_id = user.id.toString();
		this.sopiaUser.name = user.tag;
		this.sopiaUser.gender = user.gender;

		try {
			await this.$api.setUserInfo(this.sopiaUser);
		} catch {
			await this.$swal({
				icon: 'error',
				title: this.$t('error'),
				html: this.$t('app.login.unauthorized-logout'),
			});
			window.logout();
			return;
		}

		if ( +this.sopiaUser.spoon_id !== user.id ) {
			await this.$swal({
				icon: 'warning',
				title: this.$t('msg.alert'),
				html: this.$t('app.login.error.diff_id'),
				confirmButtonText: this.$t('confirm'),
			});
			return;
		}

		const { id, token, refresh_token } = this.$sopia.logonUser;
		this.$cfg.set('auth.spoon.id', id);
		this.$cfg.set('auth.spoon.token', token);
		this.$cfg.set('auth.spoon.refresh_token', refresh_token);
		this.$cfg.set('auth.sopia', this.sopiaUser);
		this.$cfg.save();

		this.loginSpoon(this.$sopia.logonUser);
	}

	public loginSpoon(user: LogonUser) {
		this.$emit('input', false);
		this.$evt.$emit('user', user);
		this.$store.commit('user', user);
		this.sopiaShow = false;
		this.spoonShow = false;

		this.$api.activityLog('logon');
	}

}
</script>
