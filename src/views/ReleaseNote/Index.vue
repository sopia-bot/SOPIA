<!--
 * Index.vue
 * Created on Thu Oct 08 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
-->
<template>
	<v-main class="custom grey lighten-4" style="height: 100vh;">
		<vue-scroll @handle-scroll="scrollEvent" style="max-height: calc(100vh - 48px);">
			<v-card v-for="(note, i) in releaseNotes" :key="note.node_id" class="ma-12">
				<v-card-text>
					<h1>{{ note.name }} <v-chip small outlined v-if="i == 0" class="ml-2" color="indigo">Latest</v-chip></h1>
				</v-card-text>
				<v-card-text class="release-note">
					<div v-html="mark(note.body)"></div>
				</v-card-text>
			</v-card>
		</vue-scroll>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import axios from 'axios';
import { marked } from 'marked/lib/marked.umd.js';

@Component
export default class ReleaseNote extends Mixins(GlobalMixins) {

	public releaseNotes: any[] = [];

	public async created() {
		const res = await axios.get('https://api.github.com/repos/sopia-bot/SOPIA/releases')
		this.releaseNotes = res.data;
	}

	public scrollEvent(vertical: any) {
		if ( vertical.process >= 0.9 ) {
			//this.getNextLiveList();
		}
	}

	public mark(html: string) {
		return marked(html);
	}

}
</script>
<style>
.release-note h2 {
	margin-top: 10px;
	margin-bottom: 10px;
}
</style>