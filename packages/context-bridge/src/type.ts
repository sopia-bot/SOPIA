
export interface SOPIAFunction {
	app: {
		minimize: () => void;
		maximize: () => void;
		toggleMaximize: () => void;
		quit: () => void;
	}
}