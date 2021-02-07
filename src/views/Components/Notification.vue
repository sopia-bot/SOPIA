<!--
 * Notification.vue
 * Created on Sat Aug 29 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-snackbar
		v-model="open"
		:timeout="timeout"
		:left="horizontal === 'left'"
		:right="horizontal === 'right'"
		:top="vertical === 'top'"
		:bottom="vertical === 'bottom'"
  		:centered="vertical === 'middle' && horizontal === 'center'"
		:color="colors[type]">
		<template v-slot:action="{ attrs }">
			<div style="width: 37px;">
				<v-icon v-bind="attrs" class="mr-2" :style="{ color: textColors[type] }">
					{{ icons[type] }}
				</v-icon>
			</div>
		</template>
		<span :style="{ color: textColors[type] }">{{ content }}</span>
	</v-snackbar>
</template>
<script>
export default {
	'name': 'Modal',
	'props': {
		'type': {
			'type': String,
			'default': 'none',
		},
		'open': {
			'type': Boolean,
			'default': false,
		},
		'timeout': {
			'type': Number,
			'default': 5000,
		},
		'content': {
			'type': String,
			'default': 'Snack Content',
		},
		'horizontal': {
			'type': String,
			'default': 'center', // left center right
		},
		'vertical': {
			'type': String,
			'default': 'middle', // top middle bottom
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
				'error': '#FFCDD2',
				'success': '#C8E6C9',
				'none': '',
			},
			'textColors': {
				'info': '#1565C0',
				'warning': '#E65100',
				'error': '#E53935',
				'success': '#2E7D32',
			},
		};
	},
};
</script>
