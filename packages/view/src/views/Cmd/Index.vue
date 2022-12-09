<!--
 * Index.vue
 * Created on Fri Nov 27 2020
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<v-main class="custom grey lighten-4 py-6" style="overflow-y: auto; max-height: 100vh;">
		<v-row align="center" class="ma-0" style="min-height: 100vh;">
			<v-col
				class="pt-0"
				offset="1"
				offset-sm="2"
				offset-lg="3"
				cols="10"
				sm="8"
				lg="6"
				align="center">
				<v-row align="center" class="ma-0">
					<v-col cols="8" align="left" class="pt-0">
						<span
							class="text-capitalize indigo--text text--darken-4"
							style="font-size: 2rem !important;">{{ $t('cmd.title') }}</span>
					</v-col>
					<v-col cols="4" align="end" class="pt-0">
						<v-layout justify-end align-end>
							<v-switch
								v-model="use"
								color="indigo"
								class="custom"
								inset
								:label="$t('enable')"
								>
							</v-switch>
						</v-layout>
					</v-col>
				</v-row>
				<v-row align="center">
					<v-col cols="12" align="left" class="pt-0">
						<p v-html="$t('cmd.'+setType+'-desc')"></p>
						<v-btn
							v-for="type of typeList"
							:key="type.href"
							rounded depressed
							:outlined="!type.isActive(type.href)"
							:text="!type.isActive(type.href)"
							:color="type.isActive(type.href) ? 'primary' : 'grey darken-2'"
							class="mr-2"
							@click="$assign(type.href)">
							{{ type.text }}
						</v-btn>
					</v-col>
				</v-row>
				<v-divider class="my-3"></v-divider>
				<v-row align="end" class="mt-4 mb-0">
					<v-col cols="8" align="left">
						<span class="text-caption" style="font-size: 11pt !important;" v-html="$t('cmd.'+setType+'-ex')"></span>
					</v-col>
					<v-col cols="4" align="right">
						<v-btn
							tile
							:dark="!loading"
							color="green darken-2"
							:loading="loading"
							:disabled="loading"
							@click="save">
							{{ $t('apply') }}
						</v-btn>
					</v-col>
				</v-row>
				<v-row align="center" class="mt-0">
					<v-col cols="12" align="center" class="pt-0">
						<transition name="scroll-y-reverse-transition">
            				<router-view></router-view>
						</transition>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
		<div style="height:50px;"></div>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import CfgLite from '@/plugins/cfg-lite-ipc';
import { LiveEvent } from '@sopia-bot/core';


@Component
export default class Cmd extends Mixins(GlobalMixins) {
	public setType: string = 'live_join';
	public use: boolean = this.$cfg.get(`cmd.${this.setType}.use`) ?? false;
	public cfgPath: string = this.$path('userData', 'cmd.cfg');
	public cfg: CfgLite = new CfgLite(this.cfgPath);
	public loading: boolean = false;

	public typeList: any[] = [
		{
			href: '/cmd/live_join/',
			text: this.$t('page.Join'),
			isActive: this.isActive.bind(this),
		},
		{
			href: '/cmd/live_like/',
			text: this.$t('page.Like'),
			isActive: this.isActive.bind(this),
		},
		{
			href: '/cmd/live_present/',
			text: this.$t('page.Present'),
			isActive: this.isActive.bind(this),
		},
		{
			href: '/cmd/live_message/',
			text: this.$t('page.Message'),
			isActive: this.isActive.bind(this),
		},
	];

	public liveLike: string = '';

	public render = {
		present: true,
	};

	public isActive(href: string) {
		return this.$route.path === href;
	}

	public async mounted() {
		const m = this.$route.path.match(/\/cmd\/(.*)?\//);
		if ( m ) {
			this.setType = m[1] as string;
			this.use = this.$cfg.get(`cmd.${this.setType}.use`) ?? false;
		}
	}

	public save() {
		this.loading = true;
		this.$evt.$emit('cmd:save');
		this.$evt.$emit('cmd:reload');
		this.$swal({
			icon: 'success',
			toast: true,
			position: 'top-end',
			html: this.$t('save-success'),
			showCloseButton: false,
			showConfirmButton: false,
			timer: 5000,
		});

		this.$cfg.set(`cmd.${this.setType}.use`, this.use);
		if ( this.setType === LiveEvent.LIVE_PRESENT ) {
			this.$cfg.set(`cmd.${LiveEvent.LIVE_PRESENT_LIKE}.use`, this.use);
		}
		this.$cfg.save();
		this.$logger.success('cmd', `Save success config file. [${this.cfgPath}]`, this.cfg.get());
		this.loading = false;
		window.reloadCmdCfg();
	}


}
</script>
<style scope>
.custom .v-input--selection-controls.v-input {
	margin-top: 1rem;
}
</style>
