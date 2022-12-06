<template>
	<div style="display: contents; position: relative;" @click.stop="() => {}">
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
			<v-list>
				<v-list-item v-for="user in users" :key="user.tag">
					<v-badge
						v-if="user.current_live_id"
						avatar
						bottom
						color="red accent-4"
						dot
						offset-x="25"
						offset-y="17">
						<v-list-item-avatar
							@click="$evt.$emit('live-join', user.current_live_id)"
							style="cursor: pointer;"
							class="ml-0 grey lighten-2">
							<v-img :src="user.profile_url"></v-img>
						</v-list-item-avatar>
					</v-badge>
					<v-list-item-avatar v-else class="grey lighten-2">
						<v-img :src="user.profile_url"></v-img>
					</v-list-item-avatar>

					<v-list-item-content>
						<v-list-item-title>
							<router-link class="blue-grey--text" :to="`/user/${user.id}/`" @click="outerClick">{{ user.nickname }}</router-link>
						</v-list-item-title>
						<v-list-item-subtitle>@{{ user.tag }}</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</v-list>
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
		width: '0',
		display: 'none',
	};
	public increment = 0;
	public users: User[] = [];

	public mounted() {
		this.outerClick = this.outerClick.bind(this);
		this.$nextTick(() => {
			window.addEventListener('click', this.outerClick);
		});
	}

	public beforeUnmount() {
		window.removeEventListener('click', this.outerClick);
	}

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
		this.boxStyle.width = Math.floor(this.getBoxRect().width) + 'px';

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
		this.boxStyle.display = 'block';
		this.users = req.res.results.splice(0, 5);
	}

	public getBoxRect(): DOMRect {
		const box = (this.$refs.searchBox as Vue)?.$el as HTMLElement;
		return box?.getBoundingClientRect();
	}

	public getCardLeft() {
		return this.getBoxRect()?.left || 0;
	}

	public getCardTop() {
		return (this.getBoxRect()?.top + this.getBoxRect()?.height) + 10 || 0;
	}

	public outerClick() {
		this.boxStyle.display = 'none';
	}

}
</script>
