<!--
 * Index.vue
 * Created on Sun Aug 02 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-main class="custom indigo lighten-5" style="height: 100vh;">
		<search-header></search-header>
		<vue-scroll @handle-scroll="scrollEvent" style="max-height: calc(100vh - 64px);">
			<div style="max-height: calc(100vh - 58px);">
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
				</v-row>
			</div>
		</vue-scroll>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { ApiManager, ApiRequest, Play, User } from 'sopia-core';
import LiveItem from './LiveItem.vue';
import SearchHeader from '../Search/Header.vue';

const sleep = (msec: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, msec);
	});
};


@Component({
	components: {
		LiveItem,
		SearchHeader,
	},
})
export default class Home extends Mixins(GlobalMixins) {
	public liveManager!: ApiManager<Play>;
	public liveList: Play[] = [];
	public liveSubscribed: Play[] = [];
	public asyncMutex: boolean = false;
	public loadComplete: boolean = false;

	// TODO: Can setting audult content
	public async getNextLiveList() {

		if ( this.loadComplete || this.asyncMutex ) {
			return;
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

		if ( this.liveManager.response.next === '' ) {
			this.loadComplete = true;
		}

		this.asyncMutex = false;
	}

	public async mounted() {
		this.$evt.$on('user', async (user: User) => {
			this.liveSubscribed = [];
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
		this.getNextLiveList();
		if ( window.user ) {
			this.liveSubscribed = [];
			if ( window.user.currentLive ) {
				const myLiveId = window.user.currentLive.id;
				const myLive = await this.$sopia.liveManager.liveInfo(myLiveId);
				this.liveSubscribed.push(myLive);
			}

			const lives = await this.$sopia.liveManager.liveSubscribed();
			for ( const live of lives.data ) {
				this.liveSubscribed.push(live);
			}
		}
	}

	public scrollEvent(vertical: any) {
		if ( vertical.process >= 0.9 ) {
			this.getNextLiveList();
		}
	}
}
</script>
