export interface BundlePackage {
	name: string;
	version: string;
	description: string;
	page: string;
	icon: string;
	idx: number;
	owner: number;
	owner_name: string;
	dependencies: Record<string, string>;
}

export default {};
