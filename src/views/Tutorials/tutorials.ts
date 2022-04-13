export default async function(this: any) {
	const stepHello: any[] = [
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
					callback: () => { /* empty */ },
				},
				this.$t('tutorial.step-hello.nice2meetu'),
			],
		},
		{
			type: 'speech',
			author: this.$t('tutorial.author'),
			text: this.$t('tutorial.step-hello.1'),
		},
	];
}
