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
</style>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import axios from 'axios';
import { marked } from 'marked/lib/marked.umd.js';
import { IpcRendererEvent } from 'electron';
const { ipcRenderer } = window.require('electron');

@Component
export default class UpdateDialog extends Mixins(GlobalMixins) {

	public async created() {
		this.alertUpdate = this.alertUpdate.bind(this);
		ipcRenderer.on('app:update', this.alertUpdate);
	}

	public beforeUnmount() {
		ipcRenderer.removeListener('app:update', this.alertUpdate);
	}

	public async alertUpdate(evt: IpcRendererEvent, version: string) {
		if ( this.$cfg.get(`skip-update.${version}`) ) {
			return;
		}
		let releaseNote = this.$t('app.release.can-not-load');
		try {
			const res = await axios.get(`https://api.github.com/repos/sopia-bot/SOPIA/releases/tags/${version}`);
			releaseNote = res.data.body;
		} catch {
			// ignore
		}
		const result = await this.$swal({
			icon: 'info',
			title: this.$t('app.release.alert-update'),
			html: `
				<div class="pa-4" id="release-note">${marked(releaseNote)}</div>
			`,
			showCancelButton: true,
			showDenyButton: true,
			denyButtonText: this.$t('app.release.skip'),
			confirmButtonText: this.$t('app.release.update'),
			cancelButtonText: this.$t('app.release.after'),
		});
		if ( result.isConfirmed ) {
			// update now
			ipcRenderer.send('update');
		} else if ( result.isDenied ) {
			// skip update this version
			this.$cfg.set(`skip-update.${version}`, true);
			this.$cfg.save();
		} else if ( result.isDismissed ) {
			// after alert
		}
	}

}
</script>
