/* tslint:disable */

export function stepHello (this: any) {
	return [
		{
			type: 'speech',
			author: '???',
			text: this.$t('tutorial.step-hello.0'),
		},
		{
			type: 'select',
			items: [
				{
					text: this.$t('tutorial.step-hello.whoru'),
					callback: () => {
						this.step.splice(this.idx, 0, ...[
							{
								type: 'speech',
								author: '???',
								text: this.$t('tutorial.step-hello.sub1.0'),
							},
							{
								type: 'speech',
								author: '???',
								text: this.$t('tutorial.step-hello.sub1.1'),
							},
						]);
					},
				},
				{
					text: this.$t('tutorial.step-hello.nice2meetu'),
					callback: () => {

					},
				},
			],
		},
		{
			type: 'speech',
			author: this.$t('tutorial.author'),
			text: this.$t('tutorial.step-hello.1'),
		},
	];
}