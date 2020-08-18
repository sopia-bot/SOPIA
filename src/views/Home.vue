<!--
 * Home.vue
 * Created on Sun Aug 02 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-main class="indigo lighten-5" style="min-height: 100vh">
		<v-row v-if="liveList.data" class="ma-0">
			<v-col
				v-for="(live, idx) in liveList.data"
				:key="live.id"
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
								{{ live.title }}
							</v-card-text>

							<v-card-actions>
								<v-list-item class="grow">
									<v-list-item-avatar>
										<v-img
											:src="live.author.profileUrl"></v-img>
									</v-list-item-avatar>

									<v-list-item-content>
										<v-list-item-title>{{ live.author.nickname }}</v-list-item-title>
									</v-list-item-content>

									<v-row
										align="center"
										justify="end"
										>
										<span class="mr-1">·</span>
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
		</v-row>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '../plugins/mixins';
import { ApiManager, ApiRequest } from 'sopia-core';

@Component
export default class Home extends Mixins(GlobalMixins) {
	public liveList: ApiManager = new ApiManager(new ApiRequest(''));

	// TODO: Can setting audult content
	public async getNextLiveList() {
		if ( this.liveList && this.liveList.data ) {
			this.liveList = await this.liveList.next();
		} else {
			this.liveList = await this.$sopia.liveManager.livePopular();
			console.log(this.liveList);
		}
	}

	public async mounted() {
		await this.getNextLiveList();
	}
}
</script>
