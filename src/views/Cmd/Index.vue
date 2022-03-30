<!--
 * Index.vue
 * Created on Fri Nov 27 2020
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<v-main class="custom indigo lighten-5" style="overflow-y: auto;">

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
				<v-row align="end" class="mt-4 mb-0">
					<v-col cols="8" align="left">
						<span class="text-caption" style="font-size: 11pt !important;" v-html="$t('cmd.'+setType+'-ex')"></span>
					</v-col>
					<v-col cols="4" align="right">
						<v-btn tile dark color="green darken-2" @click="save">
							{{ $t('apply') }}
						</v-btn>
					</v-col>
				</v-row>
				<v-row align="center" class="mt-0">
					<v-col cols="12" align="center" class="pt-0">

            <router-view></router-view>

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
			const t = this as any;
			t.setType = this.$route.params['type'];
		},
	},
})
export default class Cmd extends Mixins(GlobalMixins) {
	public setType: string = 'join';
	public use: boolean = true;
	public cfgPath: string = this.$path('userData', 'cmd.cfg');
	public cfg: CfgLite = new CfgLite(this.cfgPath);

	public liveLike: string = '';

	public render = {
		present: true,
	};


	public async mounted() {
		const m = this.$route.path.match(/\/cmd\/(.*)?\//);
		if ( m ) {
			this.setType = m[1] as string;
		}
	}

	public save() {
		this.$evt.$emit('cmd:save');
		this.$evt.$emit('cmd:reload');
		this.$noti({
			content: this.$t('save-success'),
			horizontal: 'right',
			vertical: 'top',
		});
		this.$cfg.set('cmd.use', this.use);
		this.$cfg.save();
		this.$logger.success('cmd', `Save success config file. [${this.cfgPath}]`, this.cfg.get());
		window.reloadCmdCfg();
	}


}
</script>
<style scope>
.custom .v-input--selection-controls.v-input {
	margin-top: 1rem;
}
</style>
