const rand = (num=0, min=0) => Math.floor(Math.random() * (num)) + min;
const random = (items) => items[rand(items.length)];

function randomOnPickByPer(list = []) {
	const allItem = [];

	list.forEach((item) => {
		const count = item.percentage.toFixed(2) * 100;
		for ( let i = 0 ;i < count;i++ ) {
			allItem.push(item);
		}
	});

	const wrongCount = 10000 - allItem.length;

	if ( wrongCount ) {
		for ( let i = 0;i < wrongCount;i++ ) {
			allItem.push({ value: '꽝' });
		}
	}

	return random(allItem);
}


const items = [
	{ value: '꽝', percentage: 0 },
	//{ value: '70% 확률 1', percentage: 50 },
	{ value: '45% 확률 1', percentage: 45 },
	{ value: '30% 확률 1', percentage: 30 },
	{ value: '22% 확률 2', percentage: 22 },
	//{ value: '10% 확률 1', percentage: 10 },
	//{ value: '10% 확률 2', percentage: 10 },
	//{ value: '10% 확률 3', percentage: 10 },
	//{ value: '10% 확률 4', percentage: 10 },
	//{ value: '3%  확률 1', percentage: 3 },
	//{ value: '1%  확률 1', percentage: 1 },
	//{ value: '1%  확률 2', percentage: 1 },
	//{ value: '1%  확률 3', percentage: 1 },
	//{ value: '1%  확률 4', percentage: 1 },
	//{ value: '1%  확률 5', percentage: 1 },
	//{ value: '1%  확률 6', percentage: 1 },
];

const count = {
	total: 0,
	'꽝': 0,
};

items.forEach((item) => {
	count[item.value] = 0;
});

setInterval(() => {
	console.clear();
	for ( const [key, val] of Object.entries(count) ) {
		console.log(key, val);
	}
	console.log('');
	let sum = 0;
	for ( const [key, val] of Object.entries(count) ) {
		if ( key !== 'total' ) {
			const per = count[key]  * 100 / count.total;
			console.log(`${key} : ${per}%`);
			if ( key !== '꽝' ) {
				sum += per;
			}
		}
	}
	console.log(`꽝 제외 총 확률: ${sum}%`);
}, 100);

function run() {
	const item = randomOnPickByPer([...items]);
	//console.log(item);
	count.total += 1;
	if ( item ) {
		if ( typeof count[item.value] !== 'number' ) {
			count[item.value] = 1;
		} else {
			count[item.value] += 1;
		}
	} else {
			count['꽝'] += 1;
	}
	setImmediate(run);
}
setImmediate(run);