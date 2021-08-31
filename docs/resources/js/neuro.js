const neuro = require('neuro.umd.js');

module.exports = class {

	constructor() {
		this.TextClassifier = neuro.classifiers.multilabel.BinaryRelevance.bind(0, {
			binaryClassifierType: neuro.classifiers.Winnow.bind(0, { retrain_count: 10 })
		});

		this.WordExtractor = (input, features) => {
			input.split(" ").forEach((word) => {
				features[word] = 1;
			});
		};

		this.intentClassifier = new neuro.classifiers.EnhancedClassifier({
			classifierType: this.TextClassifier,
			featureExtractor: this.WordExtractor
		});
	}

	learn(arr) {
		const data = this.toJSON();
		const l = [];
		for ( const a of arr ) {
			const f = data.find( d => d.input === a.input );
			if ( f ) {
				f.output[0] = a.output;
			} else {
				l.push(a);
			}
		}
		if ( l.length > 0 ) {
			this.intentClassifier.trainBatch(l);
		}
		this.intentClassifier.retrain();
	}

	forget(obj) {
		const data = this.toJSON();
		for ( let i=0;i<data.length;i++ ) {
			const d = data[i];
			if ( d.input === obj.input && d.output[0] === obj.output ) {
				this.intentClassifier.pastTrainingSamples.splice(i, 1);
				break;
			}
		}
		this.intentClassifier.retrain();
	}

	answer(text) {
		return this.intentClassifier.classify(text)[0];
	}

	toJSON() {
		return this.intentClassifier.pastTrainingSamples;
	}

}
