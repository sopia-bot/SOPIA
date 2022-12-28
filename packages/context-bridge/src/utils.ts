import { createHash } from 'crypto';

export function createSOPIAKey(key: string) {
	return createHash('sha1').update(key).digest().toString('hex');
}