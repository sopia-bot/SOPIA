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
									style="font-size: 2rem !important;">룰렛</span>
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
				<!-- S: options.useEffect -->
				<!--
				<v-row class="ma-0" align="center">
					<v-col cols="9" align="left" class="pa-0">
						효과 사용
					</v-col>
					<v-col cols="3" align="right" class="pa-0 pl-5">
						<v-switch
								v-model="options.useEffect"
								color="indigo"
								inset
								class="ml-3"
								label="사용"
						>
						</v-switch>
					</v-col>
				</v-row>
				-->
				<!-- E: options.useEffect -->
				<!-- S: options.effectVolume -->
				<v-row class="ma-0" align="center" v-if="options.useEffect">
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
				<v-row align="center">
					<v-col cols="12" align="left">
						<span
							class="text-capitalize text-overline indigo--text text--darken-4"
							style="font-size: 1.5rem !important;">아이템</span>
					</v-col>
				</v-row>
				<v-divider></v-divider>
				<!-- S: Add item button -->
				<v-row align="center" class="mt-2">
					<v-col cols="12" class="px-3">
						<v-btn
							block tile
							dark depressed
							color="indigo"
							@click="addNewItem">
							아이템 추가
						</v-btn>
					</v-col>
				</v-row>
				<!-- E: Add item button -->
				<v-row align="center" v-for="(item, idx) of list" :key="idx + '-' + item.value">
					<v-col cols="8" class="py-0">
						<v-text-field
							:value="item.value"
							@input="keyInput(this, $event, idx, 'value')"
							hide-details
							single-line></v-text-field>
					</v-col>
					<v-col cols="4" class="py-0">
						<v-text-field
							:value="item.percentage"
							@input="keyInput(this, $event, idx, 'percentage')"
							type="number"
							hide-details
							color="indigo darken-1"
							suffix="%"
							single-line>
						</v-text-field>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-main>
</template>
<script>
const path = window.require('path');
const CfgLite = window.appCfg.__proto__.constructor;
const cfg = new CfgLite(path.join(__dirname, 'config.cfg'));

const copy = (obj) => JSON.parse(JSON.stringify(obj));

export default {
	data: () => ({
		enable: cfg.get('enable'),
		options: cfg.get('options'),
		list: cfg.get('list'),
		listCopy: [],
		leftCol: 7,
		rightCol: 5,
	}),
	mounted() {
		this.listCopy = copy(this.list);
	},
	methods: {
		addNewItem() {
			this.list.push({
				value: '',
				percentage: 100,
			});
			this.listRefresh();
		},
		keyInput(node, value, idx, key) {
			this.listCopy[idx][key] = value;
		},
		listRefresh() {
			const tmp = this.list;
			tmp.forEach((l, idx) => {
				if ( this.listCopy[idx] ) {
					l.value = this.listCopy[idx].value;
					l.percentage = +this.listCopy[idx].percentage;
				}
			});
			this.listCopy = copy(tmp);
			this.list = tmp;
		},
		save() {
			this.listRefresh();
			cfg.set('options', this.options);
			cfg.set('enable', this.enable);
			cfg.set('list', this.list);
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
