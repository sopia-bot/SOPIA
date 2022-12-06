/* tslint:disable */

let helloOption: any = {
	select1: '',
};

export function stepHello (this: any) {
	const arr: any[] = [];

	arr.push({
		type: 'speech',
		author: '???',
		text: this.$t('tutorial.step-hello.0'),
	});

	arr.push({
		type: 'select',
		items: [
			{
				text: this.$t('tutorial.step-hello.whoru'),
				callback: () => {
					helloOption.select1 = 'sub1';
				},
			},
			{
				text: this.$t('tutorial.step-hello.nice2meetu'),
				callback: () => {
					helloOption.select1 = 'sub2';
				},
			},
		],
	});

	if ( helloOption.select1 === 'sub1' ) {
		arr.push({
			type: 'speech',
			author: '???',
			text: this.$t('tutorial.step-hello.sub1.0'),
		});
		arr.push({
			type: 'speech',
			author: '???',
			text: this.$t('tutorial.step-hello.sub1.1'),
		});
	} else if ( helloOption.select1 === 'sub2' ) {
		arr.push({
			type: 'speech',
			author: '???',
			text: this.$t('tutorial.step-hello.sub2.0'),
		});
	}

	arr.push({
		type: 'speech',
		author: this.$t('tutorial.author'),
		text: this.$t('tutorial.step-hello.1'),
	});

	arr.push({
		type: 'speech',
		author: this.$t('tutorial.author'),
		text: this.$t('tutorial.step-hello.2'),
	});

	arr.push({
		type: 'speech',
		author: this.$t('tutorial.author'),
		text: this.$t('tutorial.step-hello.3'),
	});

	arr.push({
		type: 'speech',
		author: this.$t('tutorial.author'),
		text: this.$t('tutorial.step-hello.4'),
	});

	arr.push({
		type: 'run',
		callback: () => {
			this.stepCaller = this.stepLive.bind(this);
			this.next();
		},
	});

	return arr;
}

export function stepLive(this: any) {
	const arr: any[] = [];

	if ( this.$store.getters.streamingPartners.length ) {
		// partner dj
	} else {
		//
	}

	return arr;
}
