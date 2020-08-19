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
				v-for="(live, idx) in liveList"
				:key="'' + idx + live.id"
				cols="12"
				sm="6"
				md="4"
				lg="3"
				xl="2">
				<!-- S:Live Item -->
				<v-hover>
					<template v-slot="{ hover }">
						<v-card
							max-width="300"
							flat
							tile
							color="grey lighten-4"
							class="mx-auto"
							style="cursor: pointer"
							:elevation="hover ? 24 : 6"
							>
							<v-img
								max-width="300"
								max-height="250"
								aspect-ratio="1.4"
								class="elevation-0"
								:src="live.imgUrl"
								></v-img>

							<v-card-text>
								<h3>{{ live.title }}</h3>
							</v-card-text>

							<v-card-actions>
								<v-list-item class="grow">
									<v-list-item-avatar>
										<v-img
											:src="live.author.profileUrl"></v-img>
									</v-list-item-avatar>

									<v-list-item-content style="min-width: 80px">
										<v-list-item-title>{{ live.author.nickname }}</v-list-item-title>
									</v-list-item-content>

									<v-row
										align="center"
										justify="end"
										>
										<v-icon class="mr-1">mdi-account</v-icon>
										<span class="subheading mr-2">{{ live.memberCount }}</span>
										<v-icon class="mr-1">mdi-heart</v-icon>
										<span class="subheading mr-2">{{ live.likeCount }}</span>
									</v-row>
								</v-list-item>
							</v-card-actions>
						</v-card>
					</template>
				</v-hover>
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
import GlobalMixins from '../../plugins/mixins';
import { ApiManager, ApiRequest, Play } from 'sopia-core';
import InfiniteLoading from 'vue-infinite-loading';
import { StateChanger } from 'vue-infinite-loading';

const sleep = (msec: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, msec);
	});
};


@Component({
	components: {
		InfiniteLoading,
	},
})
export default class Home extends Mixins(GlobalMixins) {
	public liveManager!: ApiManager;
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

			if ( this.liveManager.response.next === '' ) {
				state?.complete();
			} else {
				state?.loaded();
			}
		} else {
			this.liveManager = await this.$sopia.liveManager.livePopular();
			this.liveList = this.liveManager.data;
		}

		this.asyncMutex = false;
	}

	public async mounted() {
		await this.getNextLiveList();
	}
}
</script>
