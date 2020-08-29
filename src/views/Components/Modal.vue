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
						<h1 class="mb-8">{{ title }}</h1>
						<span class="subtitle-1" v-html="content"></span>
					</v-col>
				</v-row>
				<v-row class="ma-0 mt-4" align="center">
					<v-col cols="12" align="center">
						<div class="flex-grow-1"></div>

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
	name: 'Modal',
	props: {
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
};
</script>
