<!--
 * Index.vue
 * Created on Tue Oct 06 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-main class="custom indigo lighten-5" style="min-height: 100vh;">
		<search-header></search-header>
		<vue-scroll @handle-scroll="scrollEvent" style="max-height: calc(100vh - 68px);">
		<v-container style="max-height: calc(100vh - 58px);">
			<v-btn-toggle
				v-model="searchType"
				tile
				color="indigo accent-3"
				group
				>

				<v-btn
					v-for="search of searchTypes"
					:key="search.value"
					:value="search.value"
					@click="searchContent(search.value)">
					{{ search.text }}
				</v-btn>
			</v-btn-toggle>

			<v-divider class="my-6 mx-2"></v-divider>

			<v-row class="ma-0">
				<v-col
					cols="12"
					sm="6"
					v-for="(search, idx) of searchList"
					:key="searchType + idx">
					<div v-if="searchType === 'user'">
						<v-list-item>
							<v-badge
								v-if="search.currentLive"
								avatar
								bottom
								color="red accent-4"
								dot
								offset-x="25"
								offset-y="17">
								<v-list-item-avatar
									@click="$evt.$emit('live-join', search.currentLive.id)"
									style="cursor: pointer;"
									class="ml-0">
									<v-img :src="search.profileUrl"></v-img>
								</v-list-item-avatar>
							</v-badge>
							<v-list-item-avatar v-else>
								<v-img :src="search.profileUrl"></v-img>
							</v-list-item-avatar>

							<v-list-item-content>
								<v-list-item-title>
									<router-link class="blue-grey--text" :to="`/user/${search.id}/`">{{ search.nickname }}</router-link>
								</v-list-item-title>
								<v-list-item-subtitle>@{{ search.tag }}</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>
					</div>
					<div v-else>
						<live-item :live="search"></live-item>
					</div>
				</v-col>
			</v-row>
		</v-container>
		</vue-scroll>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { ApiManager, Play, User, ContentType } from 'sopia-core';
import SearchHeader from './Header.vue';
import LiveItem from '../Home/LiveItem.vue';

const sleep = (msec: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, msec);
	});
};

@Component({
	components: {
		SearchHeader,
		LiveItem,
	},
})
export default class Search extends Mixins(GlobalMixins) {
	public searchManager!: ApiManager<(Play|User)>;
	public searchList: Array<Play|User> = [];
	public asyncMutex: boolean = false;
	public loadComplete: boolean = false;

	public searchTypes: any[] = [
		{
			text: this.$t('lives.search-type.user'),
			value: ContentType.USER,
		},
		{
			text: this.$t('lives.search-type.live'),
			value: ContentType.LIVE,
		},
		{
			text: this.$t('lives.search-type.cast'),
			value: ContentType.CAST,
		},
		{
			text: this.$t('lives.search-type.talk'),
			value: ContentType.TALK,
		},
	];
	public searchType: ContentType = ContentType.USER;
	public searchQuery: string = '';

	public async mounted() {
		const params = this.$route.params;
		const { type, query } = params;
		this.searchType = decodeURI(type) as ContentType;
		this.searchQuery = decodeURI(query).replace(/\/$/, '');
		this.getNextSearchList();
	}

	public async getNextSearchList() {
		if ( this.loadComplete || this.asyncMutex ) {
			return;
		}
		this.asyncMutex = true;

		if ( this.searchManager ) {
			if ( this.searchManager.response.next ) {
				this.searchManager = await this.searchManager.next();
				this.searchList = this.searchList.concat(this.searchManager.data);
			}
		} else {
			this.searchManager = await this.$sopia.searchManager.search(this.searchQuery, this.searchType);
			this.searchList = this.searchManager.data;
		}


		if ( this.searchManager.response.next === '' ) {
			this.loadComplete = true;
		}

		this.asyncMutex = false;
	}

	public searchContent(type: ContentType) {
		this.$assign(`/search/${type}/${encodeURI(this.searchQuery)}/`);
	}

	public scrollEvent(vertical: any) {
		if ( vertical.process >= 0.9 ) {
			this.getNextSearchList();
		}
	}
}
</script>
<style scope>
</style>
