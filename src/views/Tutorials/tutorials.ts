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
						this.step.splice(this.idx+1, 0, 
							{
								type: 'speech',
								author: '???',
								text: this.$t('tutorial.step-hello.sub2.0'),
							},
						);
					},
				},
			],
		},
		{
			type: 'speech',
			author: this.$t('tutorial.author'),
			text: this.$t('tutorial.step-hello.1'),
		},
		{
			type: 'speech',
			author: this.$t('tutorial.author'),
			text: this.$t('tutorial.step-hello.2'),
		},
		{
			type: 'speech',
			author: this.$t('tutorial.author'),
			text: this.$t('tutorial.step-hello.3'),
		},
		{
			type: 'speech',
			author: this.$t('tutorial.author'),
			text: this.$t('tutorial.step-hello.4'),
		},
	];
}