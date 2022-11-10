<template>
	<div style="display: contents; position: relative;">
		<v-text-field
			ref="searchBox"
			v-model="searchText"
			dense solo
			class="no-drag"
			color="primary darken-3"
			:label="$t('app.title.search')"
			append-icon="mdi-magnify"
			hide-details
			@keydown="searchKeyDown"
			@click:append="searchContent"></v-text-field>
			
		<v-card
			:elevation="8"
			style="position: fixed;"
			:style="boxStyle">
			<p v-for="user in users" :key="user.tag">{{ user.nickname }}</p>
		</v-card>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { User } from '@sopia-bot/core';

@Component
export default class PreviewList extends Mixins(GlobalMixins) {

	public searchText: string = '';
	public boxStyle = {
		left: '0',
		top: '0',
	};
	public increment = 0;
	public users: User[] = [];

	public async searchContent() {
		const text = encodeURI(this.searchText);

		this.$assign(`/search/user/${text}`);
	}

	public async searchKeyDown(evt: KeyboardEvent) {
		if ( evt.key === 'Enter' ) {
			// enter
			this.searchContent();
		}
		this.boxStyle.left = Math.floor(this.getCardLeft()) + 'px';
		this.boxStyle.top = Math.floor(this.getCardTop()) + 'px';

		if ( this.searchText.trim().length > 0 ) {
			this.increment += 1;
			setTimeout(() => {
				this.increment -= 1;
				if ( this.increment <= 0 ) {
					this.search();
					this.increment = 0;
				}
			}, 500);
		}
	}

	public async search() {
		const req = await this.$sopia.api.search.user({
			params: {
				keyword: this.searchText,
			},
		});
		this.users = req.res.results.splice(0, 5);
	}

	public getBoxRect(): DOMRect {
		const box = (this.$refs.searchBox as Vue)?.$el as HTMLElement;
		console.log('refs', this.$refs);
		return box?.getBoundingClientRect();
	}

	public getCardLeft() {
		return this.getBoxRect()?.left || 0;
	}

	public getCardTop() {
		return (this.getBoxRect()?.top + this.getBoxRect()?.height) + 10 || 0;
	}

}
</script>
