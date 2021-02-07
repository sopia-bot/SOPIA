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
		<v-card align="center">
			<v-card-text class="pt-8 py-6">
				<v-row class="ma-0" align="center">
					<v-col cols="12" align="center">
						<h1 class="mb-8 d-flex">
							<span class="mx-auto d-flex" style="align-items: center">
								<v-icon :style="{ color: colors[type] }" class="mr-2" large>{{ icons[type] }}</v-icon>
								{{ title }}
							</span>
						</h1>
						<span class="subtitle-1" v-html="content"></span>
					</v-col>
				</v-row>
				<v-row class="ma-0 mt-4" align="center">
					<v-col cols="12" align="center">
						<div class="flex-grow-1"></div>

						<v-btn
							color="red darken-1"
	   						class="mr-4"
							large
							dark
							@click="$emit('cancel', $event); $emit('update:open', false);">
							{{ textCancel }}
						</v-btn>
						<v-btn
							color="indigo"
							large
							dark
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
	'name': 'Confirm',
	'props': {
		'type': {
			'type': String,
			'default': 'none',
		},
		'open': {
			'type': Boolean,
			'default': false,
		},
		'title': {
			'type': String,
			'default': 'Confirm Title',
		},
		'content': {
			'type': String,
			'default': 'Confirm Content',
		},
		'textOk': {
			'type': String,
			'default': 'Ok',
		},
		'textCancel': {
			'type': String,
			'default': 'Cancel',
		},
	},
	'data': () => {
		return {
			'icons': {
				'info': 'mdi-information',
				'warning': 'mdi-alert',
				'error': 'mdi-close-circle',
				'success': 'mdi-checkbox-marked-circle-outline',
				'none': '',
			},
			'colors': {
				'info': '#81D4FA',
				'warning': '#FFB74D',
				'error': '#E53935',
				'success': '#43A047',
				'none': '',
			},
		};
	},
};
</script>
