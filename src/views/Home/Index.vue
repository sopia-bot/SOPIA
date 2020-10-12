<!--
 * Index.vue
 * Created on Sun Aug 02 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-main class="custom indigo lighten-5">
		<search-header></search-header>
		<v-row v-if="liveList" class="ma-0" align="center">
			<v-col
				cols="12"
				class="mt-6">
				<h2 class="ml-3">{{ $t('home.following-dj') }}</h2>
			</v-col>
			<v-col
				v-for="(live, idx) in liveSubscribed" :key="'sub' + idx + live.id"
				cols="12"
				sm="6"
				md="4"
				lg="3"
				xl="2">
				<!-- S:Live Item -->
				<live-item :live="live" />
				<!-- E:Live Item -->
			</v-col>
		</v-row>
		<v-row v-if="liveList" class="ma-0" align="center">
			<v-col
				cols="12"
				class="mt-6">
				<h2 class="ml-3">{{ $t('home.now-live') }}</h2>
			</v-col>
			<v-col
				v-for="(live, idx) in liveList" :key="'' + idx + live.id"
				cols="12"
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
import SearchHeader from '../Search/Header.vue';

const sleep = (msec: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, msec);
	});
};


@Component({
	components: {
		InfiniteLoading,
		LiveItem,
		SearchHeader,
	},
})
export default class Home extends Mixins(GlobalMixins) {
	public liveManager!: ApiManager<Play>;
	public liveList: Play[] = [];
	public liveSubscribed: Play[] = [];
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

	public mounted() {
		this.$evt.$on('user', async (user: User) => {
			this.liveSubscribed = [];
			console.log(user);
			if ( user.currentLive ) {
				const myLiveId = user.currentLive.id;
				const myLive = await this.$sopia.liveManager.liveInfo(myLiveId);
				this.liveSubscribed.push(myLive);
			}

			const lives = await this.$sopia.liveManager.liveSubscribed();
			for ( const live of lives.data ) {
				this.liveSubscribed.push(live);
			}
		});
	}
}
</script>
