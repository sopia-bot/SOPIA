import { createHash } from 'crypto';

export function createSOPIAKey(key: string) {
	return createHash('sha1').update(key).digest().toString('hex');
}

export const jsonTransformer = {
	from: (value: string) => JSON.parse(value),
	to: (value: Record<string, any>) => JSON.stringify(value),
};