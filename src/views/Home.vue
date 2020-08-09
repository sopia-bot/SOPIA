<!--
 * Home.vue
 * Created on Sun Aug 02 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-main>
		<v-row v-if="liveList.data" class="ma-0">
			<v-col
				v-for="(live, idx) in liveList.data"
				:key="live.id"
				cols="12"
				sm="6"
				md="4">
				<!-- S:Live Item -->
				<v-card
					max-width="400"
					>

					

					<v-card-actions>
						<v-list-item class="grow">
							<v-list-item-avatar color="grey darken-3">
								<v-img
									class="elevation-6"
									src="https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light"
									></v-img>
							</v-list-item-avatar>

							<v-list-item-content>
								<v-list-item-title>Evan You</v-list-item-title>
							</v-list-item-content>

							<v-row
								align="center"
								justify="end"
								>
								<v-icon class="mr-1">mdi-heart</v-icon>
								<span class="subheading mr-2">256</span>
								<span class="mr-1">·</span>
								<v-icon class="mr-1">mdi-share-variant</v-icon>
								<span class="subheading">45</span>
							</v-row>
						</v-list-item>
					</v-card-actions>
				</v-card>
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
