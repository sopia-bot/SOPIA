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
				offset-lg="4"
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
						<span v-html="$t('cmd.join-desc')"></span>
					</v-col>
				</v-row>
				<v-divider></v-divider>
				<v-row align="center">
					<v-col cols="12" align="center">
						<v-textarea
		  					color="indigo"
		  					counter
		  					row="5"
							></v-textarea>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

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

	public mounted() {
		this.setType = this.$route.params['type'];
	}
}
</script>
<style scope>
</style>
