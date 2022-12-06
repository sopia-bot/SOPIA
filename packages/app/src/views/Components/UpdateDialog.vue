<template>
	<div></div>
</template>
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
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import axios from 'axios';
import { marked } from 'marked/lib/marked.umd.js';
import pkg from '../../../package.json';

@Component
export default class UpdateDialog extends Mixins(GlobalMixins) {

	public async created() {
		if ( this.$cfg.get(`viewed-release-note.${pkg.version}`) ) {
			return;
		}
		await this.alertUpdate();
	}

	public async alertUpdate() {
		let releaseNote = this.$t('app.release.can-not-load');
		try {
			const res = await axios.get(`https://api.github.com/repos/sopia-bot/SOPIA/releases/tags/${pkg.version}`);
			releaseNote = res.data.body;
		} catch {
			// ignore
		}

		const select = await this.$swal({
			icon: 'info',
			title: this.$t('app.release.alert-update', pkg.version),
			html: `
				<div class="pa-4" id="release-note">${marked(releaseNote)}</div>
			`,
			confirmButtonText: this.$t('show-release-note'),
			showCancelButton: true,
			cancelButtonText: this.$t('close'),
		});

		if ( select.isConfirmed ) {
			window.open('https://github.com/sopia-bot/SOPIA/releases');
		}

		this.$cfg.set(`viewed-release-note.${pkg.version}`, true);
		this.$cfg.save();
	}

}
</script>
