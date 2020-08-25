<!--
 * LiveItem.vue
 * Created on Tue Aug 25 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
-->
<template>
	<v-hover>
		<template v-slot="{ hover }">
			<v-card
				max-width="300"
				height="400"
				flat
				tile
				color="grey lighten-4"
				class="mx-auto"
				style="cursor: pointer"
				:elevation="hover ? 24 : 6"
				>
				<v-img
					width="300"
					height="250"
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
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { Play } from 'sopia-core';

@Component
export default class LiveItem extends Mixins(GlobalMixins) {
	@Prop(Play) public live!: Play;
}
</script>
