<!--
 * Modal.vue
 * Created on Sat Aug 29 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-dialog
		v-model="open"
		persistent
		max-width="500px"
		width="70%">
		<v-card color="blue-grey darken-4" dark tile>
			<v-card-text class="pt-8 py-6">
				<v-row class="ma-0" align="center">
					<v-col cols="12" align="center">
						<h1 class="mb-8 d-flex text-h3 font-weight-bold">
							<span class="mx-auto d-flex indigo--text text--accent-1" style="align-items: center">
								<v-icon :style="{ color: colors[type] }" class="mr-2" large>{{ icons[type] }}</v-icon>
								{{ title }}
							</span>
						</h1>
						<span class="text-subtitle-1 blue-grey--text text--lighten-4" v-html="content"></span>
					</v-col>
				</v-row>
				<v-row class="ma-0 mt-4" align="center">
					<v-col cols="12" align="center">
						<div class="flex-grow-1"></div>

						<v-btn
							color="white"
							class="indigo--text"
							large depressed
							rounded
							width="120px"
							@click="$emit('ok', $event); $emit('update:open', false);">
							{{ textOk }}
						</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>
<script>
export default {
	name: 'Modal',
	props: {
		type: {
			type: String,
			default: 'none',
		},
		open: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
			default: 'Modal Title',
		},
		content: {
			type: String,
			default: 'Modal Content',
		},
		textOk: {
			type: String,
			default: 'Ok',
		},
	},
	data: () => {
		return {
			icons: {
				info: 'mdi-information',
				warning: 'mdi-alert',
				error: 'mdi-close-circle',
				success: 'mdi-checkbox-marked-circle-outline',
				none: '',
			},
			colors: {
				info: '#81D4FA',
				warning: '#FFB74D',
				error: '#E53935',
				success: '#43A047',
				none: '',
			},
		};
	},
};
</script>
