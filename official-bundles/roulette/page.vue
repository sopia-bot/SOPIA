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
		<v-row class="ma-0">
			<v-col
				cols="6"
				align="center">
				<v-row align="center" class="ma-0">
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
								label="사용">
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
				<v-row class="ma-0 mt-4 pl-3" align="center">
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
				<v-row v-if="options.type === 'min'" class="ma-0 pl-3" align="center">
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
				<v-row v-if="options.type === 'select'" class="ma-0 pl-3" align="center">
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
							{{ substr(options.present?.title) || '스푼을 선택해 주세요.' }}
						</v-btn>
					</v-col>
				</v-row>
				<!-- E: options.select -->
				<!-- S: options.auto -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0 pl-3">
						자동 룰렛 시작
						<v-menu
							v-model="menu"
							:close-on-content-click="false"
							:nudge-width="200"
							offset-x >
							<template v-slot:activator="{ on, attrs }">
								<v-btn
									color="indigo"
									dark icon
									v-bind="attrs"
									v-on="on">
									<v-icon>mdi-help-circle</v-icon>
								</v-btn>
							</template>

							<v-card>
								<v-container>
									<v-row class="ma-0">
										<v-col>
											<p class="ma-0">해당 기능을 사용하지 않으면<br>스푼을 쏜 이용자가 <code>!룰렛</code> 명령어를 입력해야 합니다.</p>
										</v-col>
									</v-row>
								</v-container>
							</v-card>
						</v-menu>
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-spacer></v-spacer>
						<v-switch
							v-model="options.auto"
							color="indigo"
							inset
							class="ml-3"
							:label="options.auto ? '사용 중' : '사용 안 함'">
						</v-switch>
					</v-col>
				</v-row>
				<!-- E: options.auto -->
				<!-- S: options.simple -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0 pl-3">
						룰렛 안내 제거
						<v-menu
							v-model="simpleMenu"
							:close-on-content-click="false"
							:nudge-width="200"
							offset-x >
							<template v-slot:activator="{ on, attrs }">
								<v-btn
									color="indigo"
									dark icon
									v-bind="attrs"
									v-on="on">
									<v-icon>mdi-help-circle</v-icon>
								</v-btn>
							</template>

							<v-card>
								<v-container>
									<v-row class="ma-0">
										<v-col>
											<p class="ma-0">룰렛이 돌아가는 효과 안내를 출력하지 않고 결과만 출력합니다.</p>
										</v-col>
									</v-row>
								</v-container>
							</v-card>
						</v-menu>
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-spacer></v-spacer>
						<v-switch
							v-model="options.simple"
							color="indigo"
							inset
							class="ml-3"
							:label="options.simple ? '사용 중' : '사용 안 함'">
						</v-switch>
					</v-col>
				</v-row>
				<!-- E: options.simple -->
				<!-- S: Rule -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0 pl-3">
						룰렛 규칙 설정
						<v-menu
							v-model="ruleMenu"
							:close-on-content-click="false"
							:nudge-width="400"
							offset-x >
							<template v-slot:activator="{ on, attrs }">
								<v-btn
									color="indigo"
									dark icon
									v-bind="attrs"
									v-on="on">
									<v-icon>mdi-help-circle</v-icon>
								</v-btn>
							</template>

							<v-card>
								<v-container>
									<v-row class="ma-0">
										<v-col>
											<p class="ma-0">
												사용자가 돌리는 룰렛 횟수 계산 방식을 지정합니다.
											</p>
											<p class="ma-0 mt-3">
												<b>기본</b>: 어떠한 경우에도 설정 가격 이상의 스푼에만 1회 동작합니다.
											</p>
											<p class="ma-0">
												<b>콤보</b>: 설정 가격 이상의 스푼에서 <code>n회 이상의 콤보</code>(연속 스푼)가 터졌을 시 콤보 수 만큼 동작합니다.
											</p>
											<p class="ma-0">
												<b>배분</b>: 설정 가격 이상의 스푼에서 <code>총 스푼 갯수 / 설정 스푼</code>의 몫만큼 동작합니다.
											</p>
										</v-col>
									</v-row>
								</v-container>
							</v-card>
						</v-menu>
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-select
							v-model="options.rule"
							color="indigo darken-1"
							:items="rules">
						</v-select>
					</v-col>
				</v-row>
				<!-- S: Add item button -->
				<v-row align="center" class="ma-0 mt-2">
					<v-col cols="6" class="px-3">
						<v-btn
							block tile
							dark depressed
							color="green darken-1"
							@click="exportConfigFile">
							설정 파일 내보내기
						</v-btn>
					</v-col>
					<v-col cols="6" class="px-3">
						<v-btn
							block tile
							dark depressed
							color="indigo"
							accept=".cfg"
							@click="importConfigFile">
							설정 파일 가져오기
						</v-btn>
					</v-col>
				</v-row>
				<!-- E: Add item button -->
				<!-- E: options.auto -->
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
				<!-- S: history box -->
				<v-row class="ma-0 mt-2">
					<v-col cols="12" class="pa-0" align="left">
						<span class="indigo--text text--darken-1">룰렛 동작 이력</span>
					</v-col>
					<v-col cols="12" class="pa-0" align="left">
						<pre
							class="grey lighten-3 pa-2 mt-1"
							style="overflow:auto; min-height: 100px; max-height:350px;">{{ history }}</pre>
					</v-col>
				</v-row>
				<!-- E: history box -->
			</v-col>
			<v-col cols="6" style="overflow-y: auto; max-height: calc(100vh - 48px);">
				<v-row align="center" class="ma-0" style="height: 90px;">
					<v-col cols="8" align="left">
						<span
							class="text-capitalize text-overline indigo--text text--darken-4"
							style="font-size: 2rem !important;">아이템</span>
					</v-col>
					<v-col cols="4" align="right">
						당첨 확률: {{ totalItemPercentage }} %
					</v-col>
				</v-row>
				<v-divider></v-divider>
				<!-- S: Add item button -->
				<v-row align="center" class="ma-0 mt-2">
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
				<v-row align="center" class="ma-0" v-for="(item, idx) of list" :key="idx + '-' + item.value">
					<v-col cols="8" class="py-0">
						<v-text-field
							:value="item.value"
							@input="keyInput(this, $event, idx, 'value')"
							hide-details
							single-line></v-text-field>
					</v-col>
					<v-col cols="3" class="py-0">
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
					<v-col cols="1" class="py-0">
						<v-btn
							icon color="red darken-1"
							style="margin-top: 15px;"
							@click="deleteItem(idx)">
							<v-icon>mdi-delete</v-icon>
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-main>
</template>
<script>
const fs = window.require('fs');
const path = window.require('path');
const CfgLite = window.appCfg.__proto__.constructor;
const cfgPath = path.join(__dirname, 'config.cfg');
let cfgRemoved = false;
let cfg;
try {
	cfg = new CfgLite(cfgPath);
} catch {
	if ( fs.existsSync(cfgPath) ) {
		fs.rmSync(cfgPath);
		cfgRemoved = true;
	}
	cfg = new CfgLite(cfgPath);
}
const { ipcRenderer } = window.require('electron');
const ctx = window.bctx.get('roulette');

const copy = (obj) => JSON.parse(JSON.stringify(obj));

export default {
	data: () => ({
		enable: cfg.get('enable') ?? false,
		options: cfg.get('options') || {   
			'min': '1',
			'useEffect': false,
			'effectVolume': 50,
			'type': 'min',
			'auto': true,
			'rule': 'default',
			'simple': false,
        },
		rules: [
			{ text: '기본', value: 'default' },
			{ text: '콤보', value: 'combo' },
			{ text: '배분', value: 'division' },
		],
		ruleMenu: false,
		simpleMenu: false,
		list: [],
		listCopy: [],
		leftCol: 7,
		rightCol: 5,
		history: '',
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
		validStickers: [],
		present: false,
		gift_coin: '',
		menu: false,
	}),
	async mounted() {
		if ( cfgRemoved ) {
			await this.$swal({
				icon: 'error',
				html: '설정파일을 불러올 수 없습니다.<br>새로운 설정파일을 초기화합니다.',
				title: '에러',
			});
		}
		await this.init();
		this.listRefresh();
	},
	methods: {
		async init() {
			this.list = cfg.get('list') || [];
			this.listCopy = copy(this.list);
			const p = path.join(__dirname, 'gift_coin.png');
			this.gift_coin = 'data:image/png;base64,' + fs.readFileSync(p, 'base64');

			ctx.ipc.register('history:set', (str) => {
				this.history = str;
			});

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
		asleep(ms) {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		},
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
		deleteItem(idx) {
			console.log('delete', idx, this.list);
			this.listCopy.splice(idx, 1);
			this.list = copy(this.listCopy);
		},
		selectPresent(sticker, idx) {
			this.options.present = sticker;
		},
		substr(str) {
			if ( str ) {
				if ( str.length > 15 ) {
					return str.substr(0, 15) + '...';
				}
			}
			return str;
		},
		save() {
			this.listRefresh();
			
			let sum = 0;
			this.list.forEach((item) => sum += item.percentage);
			if ( sum > 100 ) {
				this.$swal({
					icon: 'error',
					html: `아이템들의 총 확률은 100을 넘길 수 없습니다.<br>현재: ${sum}%`,
					title: '에러',
				});
				return;
			}

			if ( this.options.type === 'select' && !this.options.present ) {
				this.$swal({
					icon: 'error',
					html: '지정 스푼 옵션을 사용할 경우, 스푼을 선택해 주세요.',
					title: '에러',
				});
				return;
			}
			cfg.set('options', this.options);
			cfg.set('enable', this.enable);
			cfg.set('list', this.list);
			cfg.save();
			this.$swal({
				icon: 'success',
				html: '저장에 성공했습니다.',
				position: 'top-end',
				toast: true,
				showCloseButton: false,
				showConfirmButton: false,
				timer: 3000,
			});
			this.reload();
		},
		copy(src, dst) {
			fs.writeFileSync(dst, fs.readFileSync(src));
		},
		async exportConfigFile() {
			const res = await ipcRenderer.invoke('open-dialog', {
				title: '저장할 경로',
				defaultPath: __dirname,
				properties: [
					'openDirectory',
				],
			});
			if ( !res.canceled ) {
				const [ folder ] = res.filePaths;
				if ( !fs.existsSync(folder) ) {
					this.$swal({
						icon: 'error',
						html: '폴더 경로가 존재하지 않습니다.',
						toast: true,
						position: 'top-end',
						timer: 3000,
					});
					return;
				}
				this.copy(path.join(__dirname, 'config.cfg'), path.join(folder, 'config.cfg'));
			}
		},
		async importConfigFile() {
			const res = await ipcRenderer.invoke('open-dialog', {
				title: '설정 파일 선택',
				defaultPath: __dirname,
				properties: [
					'openFile',
				],
			});
			if ( !res.canceled ) {
				const [ file ] = res.filePaths;
				if ( !fs.existsSync(file) ) {
					this.$swal({
						icon: 'error',
						html: '파일이 존재하지 않습니다.',
						toast: true,
						position: 'top-end',
						timer: 3000,
					});
					return;
				}
				try {
					// check valid config file
					new CfgLite(file);
				} catch {
					console.log('Cannot load config file', file);
					this.$nextTick(() =>{
						this.$swal({
							icon: 'error',
							html: '잘못된 설정파일입니다.',
							title: '에러',
						});
					});
					return;
				}
				this.copy(file, path.join(__dirname, 'config.cfg'));
				cfg = new CfgLite(path.join(__dirname, 'config.cfg'));
				this.list = cfg.get('list') || [];
				this.listCopy = copy(this.list);
				this.options = cfg.get('options') || {   
					'min': '1',
					'useEffect': false,
					'effectVolume': 50,
					'type': 'min',
					'auto': true,
				};
				this.enable = cfg.get('enable') ?? false;
				this.save();
			}
		},
	},
	computed: {
		totalItemPercentage() {
			return (this.list || []).reduce((p=0, c) => p + +c.percentage, 0);
		},
	},
}
</script>