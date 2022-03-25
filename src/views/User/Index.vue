<!--
 * Index.vue
 * Created on Thu Oct 08 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
-->
<template>
	<v-main class="custom" v-if="user">
		<search-header></search-header>
		<!-- S:Image Dialog -->
		<v-dialog
			v-model="image.show"
			width="80%"
			max-width="1000px"
			content-class="custom">
			<v-img
				:src="image.src"
				aspect-ratio="1.7"
				contain
				width="100%"></v-img>
		</v-dialog>
		<!-- E:Image Dialog -->
		<v-container class="pa-0 pa-md-4">
			<!-- S:PROFILE -->
			<v-parallax
				height="300"
				class="pa-0"
				:src="user.profile_url">
				<v-row align="start" class="ma-0" style="background-color: rgba(0, 0 ,0, 0.6);">
					<v-col cols="12" align="center" style="min-height: 72px;">
						<v-chip
		  					v-if="isLive"
							class="ma-2"
							@click="joinLive"
							color="red darken-2"
							dark
							style="cursor: pointer;">ON AIR</v-chip>
					</v-col>
				</v-row>
				<v-row align="end" class="ma-0" style="background-color: rgba(0, 0 ,0, 0.6);">
					<v-col cols="12">
						<v-list-item>
							<v-list-item-avatar size="60" style="border: 3px solid white; cursor: pointer;">
								<v-img :src="user.profile_url" @click="image.src = user.profile_url; image.show = true;"></v-img>
							</v-list-item-avatar>

							<v-list-item-content>
								<v-list-item-title>
									<h2 class="white--text">{{ user.nickname }}</h2>
								</v-list-item-title>
								<v-list-item-subtitle class="white--text">@{{ user.tag }}</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>
						<v-list-item>
							<v-list-item-content class="pa-0" style="min-height: 30px;">
								<v-list-item-title>
									<p class="white--text ma-0 ml-2 font-weight-bold">
										<span class="mr-3">{{ user.follower_count }} {{ $t('users.fan') }}</span>
										{{ user.following_count }} {{ $t('users.following') }}
									</p>
								</v-list-item-title>
							</v-list-item-content>
						</v-list-item>
					</v-col>
				</v-row>
				<v-row class="ma-0" style="background-color: rgba(0, 0 ,0, 0.6);">
					<v-col cols="12" class="py-0 pl-6">
						<v-btn
							v-if="user.follow_status === 0"
							rounded large
							width="200"
							dark color="black"
							@click="followThisUser">
							<v-icon left>mdi-account-plus</v-icon>
							{{ $t('users.fan') }}
						</v-btn>
						<v-btn
							v-else
							rounded large
							width="200"
							dark outlined
							color="white"
							@click="unfollowThisUser">
							<v-icon left>mdi-account-check</v-icon>
							{{ $t('users.following') }}
						</v-btn>
					</v-col>
				</v-row>
			</v-parallax>
			<!-- E:PROFILE -->
		</v-container>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { User, Live } from '@sopia-bot/core';
import { deserialize } from 'typescript-json-serializer';
import SearchHeader from '../Search/Header.vue';

@Component({
	components: {
		SearchHeader,
	},
})
export default class UserPage extends Mixins(GlobalMixins) {
	public user: User = {} as User;
	public image = {
		show: false,
		src: '',
	};

	get isLive() {
		return !!this.user?.current_live?.id;
	}

	public async created() {
		const { id } = this.$route.params;
		if ( id ) {
			let req: any = await this.$sopia.api.users.info(+id);
			this.user = req.res.results[0];

			req = await this.$sopia.api.users.live(+id);
			const live = req.res.results[0];
			console.log('live', live);
			if ( live.is_live ) {
				this.user.current_live = deserialize<Live>({
					id: live.current_live_id,
				}, Live);
				console.log(this.user);
			}
		}
	}

	public async followThisUser() {
		const req = await this.user.follow();
		this.user = req.res.results[0];
	}

	public async unfollowThisUser() {
		const req = await this.user.unfollow();
		this.user = req.res.results[0];
	}

	public async joinLive() {
		this.$evt.$emit('live-join', this.user.current_live.id);
	}
}
</script>
<style scope>
.custom .v-parallax__content {
	padding: 0;
}
.custom.v-dialog {
	box-shadow: none !important;
}
</style>
