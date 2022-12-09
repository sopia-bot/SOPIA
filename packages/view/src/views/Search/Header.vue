<!--
 * Header.vue
 * Created on Wed Oct 07 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-app-bar
		color="indigo darken-4"
		class="search-custom"
		dark>
		<v-spacer></v-spacer>

		<v-overflow-btn
			class="my-2"
			:items="searchType"
			style="max-width: 210px;"
			:label="$t('lives.search-type.' + searchTypeSelect)"
			color="indigo"
			@change="searchTypeChange"></v-overflow-btn>
		<v-text-field
			dense solo
			class="mt-3"
			style="max-width: 300px;"
			color="transparent"
			v-model="searchText"
			@keydown="searchKeyDown"
			label="Search..."></v-text-field>
		<v-btn @click="searchContent" icon>
			<v-icon>mdi-magnify</v-icon>
		</v-btn>
	</v-app-bar>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

enum ContentType {
	USER = 'user',
	LIVE = 'live',
	CAST = 'cast',
	TALK = 'talk',
}

@Component
export default class SearchHeader extends Mixins(GlobalMixins) {
	public searchType: any[] = [
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
	public searchTypeSelect: ContentType = ContentType.USER;
	public searchText: string = '';

	public async mounted() {
		const params = this.$route.params;
		const { type, query } = params;
		if ( type && query ) {
			this.searchTypeSelect = decodeURI(type) as ContentType;
			this.searchText = decodeURI(query).replace(/\/$/, '');
		}
	}

	public searchTypeChange(type: ContentType) {
		this.searchTypeSelect = type;
	}

	public async searchContent() {
		const text = encodeURI(this.searchText);
		const type = this.searchTypeSelect;

		this.$assign(`/search/${type}/${text}`);
	}

	public async searchKeyDown(evt: KeyboardEvent) {
		if ( evt.keyCode === 13 ) {
			// enter
			this.searchContent();
		}
	}
}
</script>
<style>
.search-custom div.v-text-field__details,
.search-custom div.v-messages.theme--light,
.search-custom div.v-messages.theme--dark {
	min-height: 0;
}
.search-custom .theme--dark.v-text-field--solo > .v-input__control > .v-input__slot {
	box-shadow: unset !important;
	background: transparent !important;
}

.search-custom .v-input__slot {
	margin-bottom: 0;
}

.search-custom .theme--dark.v-overflow-btn:not(.v-input--is-focused):not(.v-input--has-state) > .v-input__control > .v-input__slot:hover {
	background: #303F9F;
}
</style>
