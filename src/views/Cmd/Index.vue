<!--
 * Index.vue
 * Created on Fri Nov 27 2020
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<v-main class="custom indigo lighten-5">
		<v-row align="center" class="ma-0" style="height: 100vh;">
			<v-col
				offset="1"
				offset-sm="2"
				offset-md="3"
				cols="10"
				sm="8"
				md="6"
				align="center">
				<v-row align="center">
					<v-col cols="8" align="left">
						<span
							class="text-capitalize text-overline indigo--text text--darken-4"
							style="font-size: 2rem !important;">{{ setType }}</span>
					</v-col>
					<v-col cols="4" align="end">
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
					<v-col cols="12" align="left">
						<span v-html="$t('cmd.'+setType+'-desc')"></span>
					</v-col>
				</v-row>
				<v-divider></v-divider>
				<v-row align="center">
					<v-col cols="12" align="center">
						<v-textarea
							v-if="setType === 'join' || setType === 'like'"
		  					color="indigo"
		  					counter
		  					row="5"
							></v-textarea>
						<v-container v-else-if="setType === 'present'">
							<v-row align="center">
								<v-col cols="3"></v-col>
								<v-col cols="9"></v-col>
							</v-row>
							<v-row align="center">
								<v-col cols="12" class="px-0">
									<v-btn block tile dark color="indigo">{{ $t('add') }}</v-btn>
								</v-col>
							</v-row>
						</v-container>
						<v-container v-else-if="setType === 'message'">
							<v-row align="center">
								<v-col cols="3"></v-col>
								<v-col cols="6"></v-col>
								<v-col cols="3"></v-col>
							</v-row>
							<v-row align="center">
								<v-col cols="12" class="px-0">
									<v-btn block tile dark color="indigo">{{ $t('add') }}</v-btn>
								</v-col>
							</v-row>
						</v-container>
					</v-col>
				</v-row>
				<v-row align="start">
					<v-col cols="8" align="left">
						<span class="text-caption" style="font-size: 11pt !important;" v-html="$t('cmd.'+setType+'-ex')"></span>
					</v-col>
					<v-col cols="4" align="right">
						<v-btn tile dark color="indigo">
							{{ $t('apply') }}
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import CfgLite from '@/plugins/cfg-lite-ipc';

@Component({
	components: {
	},
	watch: {
		$route(to, from) {
			this.setType = this.$route.params['type'];
		},
	},
})
export default class Cmd extends Mixins(GlobalMixins) {
	public setType: string = 'join';
	public use: boolean = true;
	public cfg: CfgLite = new CfgLite(this.$path('userData', 'cmd.cfg'));

	public mounted() {
		this.setType = this.$route.params['type'];
	}
}
</script>
<style scope>
.custom .v-input--selection-controls.v-input {
	margin-top: 1rem;
}
</style>
