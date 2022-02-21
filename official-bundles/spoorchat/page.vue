<template>
	<v-main>
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
				<!-- S: options.min -->
				<v-row class="ma-0" align="center">
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
export default {
	data: () => ({
		enable: cfg.get('enable'),
		options: cfg.get('options'),
		voiceList: [],
		leftCol: 7,
		rightCol: 5,
	}),
	mounted() {
		this.voiceList = cfg.get('voice-list') || [];
		this.voiceList.push({
			text: '랜덤',
			value: 'random',
		});
	},
	methods: {
		voiceSelect(val) {
			this.options.voice = val;
		},
		save() {
			cfg.set('options', this.options);
			cfg.set('enable', this.enable);
			cfg.save();
			this.$noti({
				type: 'success',
				content: '저장에 성공했습니다.',
				horizontal: 'right',
				vertical: 'end',
				timeout: 3000,
			});
			this.reload();
		},
	},
}
</script>
