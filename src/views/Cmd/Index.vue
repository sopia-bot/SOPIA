<!--
 * Index.vue
 * Created on Fri Nov 27 2020
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<v-main class="custom indigo lighten-5">
		<!-- S: Present List Dialog -->
		<v-dialog
			v-model="present"
			max-width="600"
			width="80%">
			<v-card>
				<v-card-title>
					{{ $t('cmd.sticker.list') }}
				</v-card-title>
				<v-card-text>
					<v-row class="ma-0">
						<v-col
							cols="6" md="4"
							v-for="(sticker, idx) in validStickers"
							:key="sticker.name"
							@click="addPresentEvent(idx); present = false;">
							<v-hover>
								<template v-slot:default="{ hover }">
									<v-card
										style="cursor: pointer;"
										:elevation="hover ? 12 : 0">
										<v-img
											:src="sticker.imageThumbnail"
											class="white--text align-center"
											:gradient="hover ? 'to bottom, rgba(0,0,0,.7), rgba(0,0,0,.7)' : ''"
											width="100%">
											<v-row v-if="hover" align="center">
												<v-col cols="12" class="pb-0" align="center">
													<h3>{{ sticker.title }}</h3>
												</v-col>
												<v-col cols="12" class="pt-0" align="center">
													<v-chip color="transparent">
														<v-img width="20px" :src="imgs.coin"/>
														<span class="ml-2 white--text">{{ sticker.price }}</span>
													</v-chip>
												</v-col>
											</v-row>
										</v-img>
									</v-card>
								</template>
							</v-hover>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</v-dialog>
		<!-- E: Present List Dialog -->
		<v-row align="center" class="ma-0" style="height: 100vh;">
			<v-col
				offset="1"
				offset-sm="2"
				offset-md="3"
				cols="10"
				sm="8"
				md="6"
				align="center">
				<v-row align="center">
					<v-col cols="8" align="left">
						<span
							class="text-capitalize text-overline indigo--text text--darken-4"
							style="font-size: 2rem !important;">{{ setType }}</span>
					</v-col>
					<v-col cols="4" align="end">
						<v-layout justify-end align-end>
							<v-switch
								v-model="use"
								color="indigo"
								class="custom"
								inset
								:label="$t('enable')"
								>
							</v-switch>
						</v-layout>
					</v-col>
				</v-row>
				<v-row align="center">
					<v-col cols="12" align="left">
						<span v-html="$t('cmd.'+setType+'-desc')"></span>
					</v-col>
				</v-row>
				<v-divider></v-divider>
				<v-row align="center">
					<v-col cols="12" align="center">
						<v-textarea
							v-if="setType === 'join' || setType === 'like'"
		  					color="indigo"
		  					counter
		  					row="5"
							></v-textarea>
						<v-container v-else-if="setType === 'present'">
							<div v-if="render.present" class="my-6">
								<v-row class="ma-0" v-for="(present, idx) in livePresent" :key="'present_' + present.name" align="center">
									<v-col class="pa-0" cols="4">
										<v-btn
											tile block
											color="transparent"
											depressed>
											<img :src="present.src" width="50px" />
											{{ present.title }}
										</v-btn>
									</v-col>
									<v-col cols="6" class="pa-0">
										<v-text-field
											class="pt-0"
											v-model="present.message"
											color="indigo darken-3"></v-text-field>
									</v-col>
									<v-col cols="2" class="pa-0 text-right">
										<v-btn icon depressed>
											<v-icon color="red darken-3" @click="delPresentEvent(idx);">mdi-close-circle</v-icon>
										</v-btn>
									</v-col>
								</v-row>
							</div>
							<v-row align="center">
								<v-col cols="12" class="px-0">
									<v-btn block tile dark color="indigo" @click="present = true;">{{ $t('add') }}</v-btn>
								</v-col>
							</v-row>
						</v-container>
						<v-container v-else-if="setType === 'message'">
							<v-row class="ma-0" align="center" v-for="(message, idx) in liveMessage" :key="'message_' + message.cmd + idx">
								<v-col cols="3" class="pa-0">
									<v-text-field
										:placeholder="$t('cmd.command')"
										color="indigo darken-3"
										v-model="message.command"/>
								</v-col>
								<v-col cols="6" class="py-0">
									<v-text-field
										:placeholder="$t('cmd.reply')"
										color="indigo darken-3"
										v-model="message.message"/>
								</v-col>
								<v-col cols="2" class="pa-0">
									<v-select
										:items="permitList"
										color="indigo darken-3"
										v-model="message.permit" >
										<template v-slot:selection="{ item }">
											{{ $t('cmd.permit.' + item) }}
										</template>
									</v-select>
								</v-col>
								<v-col cols="1" class="pa-0 text-right">
										<v-btn icon depressed>
											<v-icon color="red darken-3" @click="delMessageEvent(idx);">mdi-close-circle</v-icon>
										</v-btn>
									</v-col>
							</v-row>
							<v-row align="center">
								<v-col cols="12" class="px-0">
									<v-btn block tile dark color="indigo" @click="addMessageEvent">{{ $t('add') }}</v-btn>
								</v-col>
							</v-row>
						</v-container>
					</v-col>
				</v-row>
				<v-row align="start">
					<v-col cols="8" align="left">
						<span class="text-caption" style="font-size: 11pt !important;" v-html="$t('cmd.'+setType+'-ex')"></span>
					</v-col>
					<v-col cols="4" align="right">
						<v-btn tile dark color="indigo" @click="save">
							{{ $t('apply') }}
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import CfgLite from '@/plugins/cfg-lite-ipc';
import { Sticker, StickerCategory } from 'sopia-core';
import giftCoin from '@/assets/gift_coin.png';

interface PresentStruct {
	name: string;
	src: string;
	title: string;
	message: string;
}

interface MessageStruct {
	command: string;
	message: string;
	permit: string;
}

@Component({
	'components': {
	},
	'watch': {
		'$route'(to, from) {
			const t = this as any;
			t.setType = this.$route.params['type'];
		},
	},
})
export default class Cmd extends Mixins(GlobalMixins) {
	public setType: string = 'join';
	public use: boolean = true;
	public cfg: CfgLite = new CfgLite(this.$path('userData', 'cmd.cfg'));
	public present: boolean = false;
	public validStickers: Sticker[] = [];

	public liveJoin: string = '';
	public liveLike: string = '';
	public livePresent: PresentStruct[] = [];
	public liveMessage: MessageStruct[] = [];

	public readonly permitList: string[] = [ 'all', 'manager' ];

	public render = {
		'present': true,
	};

	public imgs = {
		'coin': giftCoin,
	};

	public cfgValid(cfg: CfgLite) {
		if ( cfg.get('live_join') === undefined ||
			 cfg.get('live_like') === undefined ||
			 cfg.get('live_present') === undefined ||
			 cfg.get('live_message') === undefined ) {
			this.$logger.info('cmd', 'Init cfg setting');
			cfg.set('live_join', '');
			cfg.set('live_like', '');
			cfg.set('live_present', []);
			cfg.set('live_message', []);
		}

		this.$logger.debug('cmd', 'Load cfg setting');

		this.liveJoin = cfg.get('live_join');
		this.liveLike = cfg.get('live_like');
		this.livePresent = cfg.get('live_present');
		this.liveMessage = cfg.get('live_message');
	}

	public async mounted() {
		this.setType = this.$route.params['type'];
		this.cfgValid(this.cfg);
		if ( !this.$sopia.stickers ) {
			await this.asleep(2000);
		}
		this.$sopia.stickers.categories.forEach((category: StickerCategory) => {
			if ( category.isUsed === false ) {
				return;
			}

			category.stickers.forEach((sticker: Sticker) => {
				if ( sticker.isUsed ) {
					this.validStickers.push(sticker);
				}
			});
		});
	}

	public addPresentEvent(idx: number) {
		const sticker = this.validStickers[idx];
		const valid = this.livePresent.find((p: PresentStruct) => p.name === sticker.name);

		if ( valid ) {
			this.$noti({
				'content': this.$t('cmd.sticker.exists'),
				'horizontal': 'right',
				'vertical': 'top',
			});
			return;
		}
		this.livePresent.push({
			'name': sticker.name,
			'title': sticker.title,
			'src': sticker.imageThumbnail,
			'message': '',
		});
	}

	public delPresentEvent(idx: number) {
		this.livePresent.splice(idx, 1);
	}

	public addMessageEvent() {
		this.liveMessage.push({
			'command': '',
			'message': '',
			'permit': 'all',
		});
	}

	public delMessageEvent(idx: number) {
		this.liveMessage.splice(idx, 1);
	}

	public save() {
		this.cfg.set('live_join', this.liveJoin);
		this.cfg.set('live_like', this.liveLike);
		this.cfg.set('live_present', this.livePresent);
		this.cfg.set('live_message', this.liveMessage);
		this.cfg.save();

		this.$cfg.set('cmd.use', this.use);
		this.$cfg.save();

		this.$evt.$emit('cmd:reload');
		this.$noti({
			'content': this.$t('save-success'),
			'horizontal': 'right',
			'vertical': 'top',
		});
		this.$logger.success('cmd', 'Save success config file.');
	}

}
</script>
<style scope>
.custom .v-input--selection-controls.v-input {
	margin-top: 1rem;
}
</style>
