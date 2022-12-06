<template>
	<v-main>
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
							@click="selectPresent(sticker, idx); present = false;">
							<v-hover>
								<template v-slot:default="{ hover }">
									<v-card
										style="cursor: pointer;"
										:elevation="hover ? 12 : 0">
										<v-img
											:src="sticker.image_thumbnail"
											class="white--text align-center"
											:gradient="hover ? 'to bottom, rgba(0,0,0,.7), rgba(0,0,0,.7)' : ''"
											width="100%">
										<v-row v-if="hover" align="center">
											<v-col cols="12" class="pb-0" align="center">
												<h3>{{ sticker.title }}</h3>
											</v-col>
											<v-col cols="12" class="pt-0" align="center">
												<v-chip color="transparent">
													<v-img width="20px" :src="gift_coin"/>
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
				cols="10"
				sm="8"
				md="6"
				align="center">
				<v-row align="center">
					<v-col cols="8" align="left">
						<v-row class="ma-0" align="center">
							<span
								class="text-capitalize text-overline indigo--text text--darken-4"
								style="font-size: 2rem !important;">SpoorChat</span>
							<v-switch
								v-model="enable"
								color="indigo"
								inset
								class="ml-3"
								label="사용"
								>
							</v-switch>
						</v-row>
					</v-col>
					<v-col cols="4" align="end">
						<v-layout justify-end align-end>
							<v-btn tile depressed color="indigo darken-2" dark @click="save">저장</v-btn>
						</v-layout>
					</v-col>
				</v-row>
				<v-divider></v-divider>
				<!-- S: options.type -->
				<v-row class="ma-0 mt-4" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						작동 방식
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-select
							v-model="options.type"
							color="indigo darken-1"
							:items="type">
						</v-select>
					</v-col>
				</v-row>
				<!-- E: options.type -->
				<!-- S: options.min -->
				<v-row v-if="options.type === 'min'" class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						최소 스푼 개수
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-text-field
							v-model="options.min"
							color="indigo darken-1"
							type="number"
							suffix="개">
						</v-text-field>
					</v-col>
				</v-row>
				<!-- E: options.min -->
				<!-- S: options.select -->
				<v-row v-if="options.type === 'select'" class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						스푼 선택
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-btn
							tile
							width="240px"
							color="transparent"
							depressed
							@click="present = true">
							<img
								v-if="options.present?.image_thumbnail"
								:src="options.present?.image_thumbnail"
								width="50px"
								:alt="options.present?.title"/>
							{{ substr(options.present?.title) }}
						</v-btn>
					</v-col>
				</v-row>
				<!-- E: options.select -->
				<!-- S: options.timeout -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						최대 채팅 입력 대기 시간
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-text-field
							v-model="options.timeout"
							color="indigo darken-1"
							type="number"
							suffix="초">
						</v-text-field>
					</v-col>
				</v-row>
				<!-- E: options.timeout -->
				<!-- S: options.effectVolume -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						효과음 볼륨
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-slider
							v-model="options.effectVolume"
							color="indigo darken-1"
	   						:label="options.effectVolume.toString()"
							max="100"
							min="0">
						</v-slider>
					</v-col>
				</v-row>
				<!-- E: options.effectVolume -->
				<!-- S: options.voiceVolume -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						목소리 볼륨
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-slider
							v-model="options.voiceVolume"
							color="indigo darken-1"
	   						:label="options.voiceVolume.toString()"
							max="100"
							min="0">
						</v-slider>
					</v-col>
				</v-row>
				<!-- E: options.voiceVolume -->
				<!-- S: options.voiceVolume -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						목소리 유형
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-overflow-btn
							v-model="options.voice"
							:items="voiceList"
							color="indigo darken-1"
							editable flat
							style="margin-top: 0;"
							@change="voiceSelect"
							allow-overflow>
						</v-overflow-btn>
					</v-col>
				</v-row>
				<!-- E: options.voiceVolume -->
			</v-col>
		</v-row>
	</v-main>
</template>
<script>
const path = window.require('path');
const CfgLite = window.appCfg.__proto__.constructor;
const cfg = new CfgLite(path.join(__dirname, 'config.cfg'));
const fs = window.require('fs');
export default {
	data: () => ({
		enable: cfg.get('enable'),
		options: cfg.get('options'),
		voiceList: [],
		leftCol: 7,
		rightCol: 5,
		present: false,
		validStickers: [],
		type: [
			{
				text: '지정 스푼',
				value: 'select',
			},
			{
				text: '최소 스푼',
				value: 'min',
			},
		],
	}),
	async mounted() {
		this.voiceList = cfg.get('voice-list') || [];
		this.voiceList.push({
			text: '랜덤',
			value: 'random',
		});

		const p = path.join(__dirname, 'gift_coin.png');
		this.gift_coin = 'data:image/png;base64,' + fs.readFileSync(p, 'base64');

		if ( !this.$sopia.sticker.stickers ) {
			await this.asleep(2000);
		}
		this.$sopia.sticker.stickers.categories.forEach((category) => {
			if ( !category.is_used ) {
				return;
			}

			category.stickers.forEach((sticker) => {
				if ( sticker.is_used ) {
					this.validStickers.push(sticker);
				}
			});
		});
	},
	methods: {
		asleep(ms) {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		},
		voiceSelect(val) {
			this.options.voice = val;
		},
		selectPresent(sticker, idx) {
			this.options.present = sticker;
		},
		save() {
			cfg.set('options', this.options);
			cfg.set('enable', this.enable);
			cfg.save();
			this.$swal({
				icon: 'success',
				html: '저장에 성공했습니다.',
				position: 'top-end',
				timer: 3000,
				toast: true,
			});
			this.reload();
		},
		substr(str) {
			if ( str ) {
				if ( str.length > 15 ) {
					return str.substr(0, 15) + '...';
				}
			}
			return str;
		},
	},
}
</script>
