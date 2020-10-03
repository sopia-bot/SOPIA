<!--
 * Index.vue
 * Created on Sun Aug 02 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-main class="indigo lighten-5">
		<v-row v-if="liveList" class="ma-0" align="center">
			<v-col
				v-for="(live, idx) in liveList" :key="'' + idx + live.id"
				cols="12"
				class="my-6"
				sm="6"
				md="4"
				lg="3"
				xl="2">
				<!-- S:Live Item -->
				<live-item :live="live" />
				<!-- E:Live Item -->
			</v-col>
			<v-col cols="12" align="center">
				<infinite-loading @infinite="getNextLiveList">
					<div slot="no-more" class="text-white">
						<h3 class="indigo--text text--darken-4" >{{ $t('home.load-fin') }}</h3>
					</div>
					<div slot="no-results" class="text-white">
						<h3 class="indigo--text text--darken-4" >{{ $t('home.load-fin') }}</h3>
					</div>
				</infinite-loading>
			</v-col>
		</v-row>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { ApiManager, ApiRequest, Play } from 'sopia-core';
import InfiniteLoading from 'vue-infinite-loading';
import { StateChanger } from 'vue-infinite-loading';
import LiveItem from './LiveItem.vue';

const sleep = (msec: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, msec);
	});
};


@Component({
	components: {
		InfiniteLoading,
		LiveItem,
	},
})
export default class Home extends Mixins(GlobalMixins) {
	public liveManager!: ApiManager<Play>;
	public liveList: Play[] = [];
	public asyncMutex: boolean = false;

	// TODO: Can setting audult content
	public async getNextLiveList(state?: StateChanger) {

		while ( this.asyncMutex ) {
			await sleep(100);
		}
		this.asyncMutex = true;

		if ( this.liveManager ) {
			if ( this.liveManager.response.next ) {
				this.liveManager = await this.liveManager.next();
				this.liveList = this.liveList.concat(this.liveManager.data);
			}
		} else {
			this.liveManager = await this.$sopia.liveManager.livePopular();
			this.liveList = this.liveManager.data;
		}

		state?.loaded();

		if ( this.liveManager.response.next === '' ) {
			state?.complete();
		}

		this.asyncMutex = false;
	}
}
</script>
