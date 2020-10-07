<!--
 * Index.vue
 * Created on Tue Oct 06 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-main class="custom indigo lighten-5">
		<search-header></search-header>
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
		<infinite-loading @infinite="getNextSearchList">
			<div slot="no-more" class="text-white">
				<h3 class="indigo--text text--darken-4" >{{ $t('home.load-fin') }}</h3>
			</div>
			<div slot="no-results" class="text-white">
				<h3 class="indigo--text text--darken-4" >{{ $t('home.load-fin') }}</h3>
			</div>
		</infinite-loading>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { ApiManager, Play, User, ContentType } from 'sopia-core';
import InfiniteLoading from 'vue-infinite-loading';
import { StateChanger } from 'vue-infinite-loading';
import SearchHeader from './Header.vue';

const sleep = (msec: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, msec);
	});
};

@Component({
	components: {
		InfiniteLoading,
		SearchHeader,
	},
})
export default class Search extends Mixins(GlobalMixins) {
	public searchManager!: ApiManager<(Play|User)>;
	public searchList: Array<Play|User> = [];
	public asyncMutex: boolean = false;

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
	}

	public async getNextSearchList(state?: StateChanger) {
		while ( this.asyncMutex ) {
			await sleep(100);
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

		state?.loaded();

		if ( this.searchManager.response.next === '' ) {
			state?.complete();
		}

		this.asyncMutex = false;
	}

	public searchContent(type: ContentType) {
		this.$assign(`/search/${type}/${encodeURI(this.searchQuery)}/`);
	}
}
</script>
