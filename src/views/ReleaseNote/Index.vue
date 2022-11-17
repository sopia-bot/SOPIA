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
				<v-card-text id="#release-note">
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
#release-note {
	background-color: #ebebeb;
	text-align: left;
	padding: 1rem;
	max-height: 280px;
	overflow: auto;
}
#release-note h1 {
	font-size: 1.5rem;
	margin-bottom: 1rem;
}
#release-note h2 {
	font-size: 1.3rem;
	margin-bottom: 1rem;
}
#release-note h3 {
	font-size: 1.2rem;
	margin-bottom: 1rem;
}
#release-note p {
	font-size: 0.9rem;
	margin-bottom: 1rem;
}
#release-note ul {
	margin-left: 20px;
	margin-bottom: 1rem;
}
#release-note li {
	font-size: 0.9rem;
}
#release-note a {
	text-decoration-line: none;
	color: #303F9F;
	font-weight: 500;
}
#release-note blockquote {
	padding: 0 1em;
	color: #768390;
	border-left: 0.25em solid #444c56;
}
</style>