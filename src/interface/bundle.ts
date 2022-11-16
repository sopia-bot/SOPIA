export interface BundlePackage {
	name: string;
	version: string;
	description: string;
	page: string;
	icon: string;
	idx: number;
	owner: number;
	owner_name: string;
	is_official: boolean;
	dependencies: Record<string, string>;
}

export default {};
