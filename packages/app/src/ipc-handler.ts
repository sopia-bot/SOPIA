import path from 'node:path';
import { IpcMainEvent, dialog } from 'electron';
import { install as npmInstall, InstallItem, InstallOptions } from 'npkgi';

import { ZipFile, ZipArchive } from '@arkiv/zip';
import fs from 'node:fs';
import { ipcHanger } from './utils/ipcHanger';

export const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36';


ipcHanger.on('zip:create', (evt: IpcMainEvent, src: string, dst: string) => {
	console.log('zip:create', src, dst);
	try {
		ZipFile.CreateFromDirectory(src, dst);
		evt.returnValue = true;
	} catch (err) {
		console.error(err);
		evt.returnValue = false;
	}
});

ipcHanger.on('zip:uncompress-buffer', (evt: IpcMainEvent, b64str: string, dst: string) => {
	console.log('zip:uncompress-buffer', dst);
	const archive = new ZipArchive('', Buffer.from(b64str, 'base64'));
	archive.ExtractAll(dst);
	evt.returnValue = true;
});

const buildTime = (time: Date): string => {
	const yyyy = time.getFullYear();
	const mm = (time.getMonth() + 1).toString().padStart(2, '0');
	const dd = (time.getDate()).toString().padStart(2, '0');

	const hh = time.getHours().toString().padStart(2, '0');
	const MM = time.getMinutes().toString().padStart(2, '0');
	const ss = time.getSeconds().toString().padStart(2, '0');

	return `${yyyy}${mm}${dd}-${hh}${MM}${ss}`;
};
const startTime = buildTime(new Date());
ipcHanger.on('start-time', (evt: IpcMainEvent, type: string) => {
	evt.returnValue = startTime;
});

ipcHanger.handle('open-dialog', async (event, options: any) => {
	return await dialog.showOpenDialog(options);
});

ipcHanger.handle('npm:install', async (event, packages: InstallItem[], options: InstallOptions) => {
	return await npmInstall(packages, options);
});

const readDirectory = (dir: string, cb: (...args: any) => any, oriDir?: string) => {
	if ( !oriDir ) {
		oriDir = dir;
		dir = '';
	}

	const target = path.resolve(oriDir, dir);
	const items = fs.readdirSync(target);
	items.forEach((item: string) => {
		const t = path.resolve(target, item);
		const st = path.join(dir, item).replace(/\\/g, '/');
		const stat = fs.statSync(t);
		cb(st, stat.isDirectory());
		if ( stat.isDirectory() ) {
			readDirectory(st, cb, oriDir);
		}
	});
};

ipcHanger.on('package:create', (evt: IpcMainEvent, src: string, dst: string) => {
	console.log('package:create', src, dst);
	try {
		const pkg = JSON.parse(fs.readFileSync(path.join(src, 'package.json'), 'utf8'));
		let ignore: string[] = [];
		if ( pkg.sopia ) {
			ignore = (pkg?.sopia?.['ignore:upload'] || []).map((i: string) => path.join(src, i));
		}

		const archive = new ZipArchive(dst);
		readDirectory(src, (p: string, isDir: boolean) => {
			if ( !isDir ) {
				const fullPath = path.join(src, p);
				if ( ignore.includes(fullPath) ) {
					return;
				}
				const entry = archive.CreateEntry(p);
				const data = fs.readFileSync(fullPath);
				entry.Write(data);
			}
		});

		fs.writeFileSync(dst, archive.Stream);
		evt.returnValue = true;
	} catch (err) {
		console.error(err);
		evt.returnValue = false;
	}
});

ipcHanger.on('package:uncompress-buffer', (evt: IpcMainEvent, b64str: string, dst: string) => {
	console.log('package:uncompress-buffer', dst);

	if ( !fs.existsSync(dst) ) {
		fs.mkdirSync(dst);
	}

	const archive = new ZipArchive(dst, Buffer.from(b64str, 'base64'));
	const pkgEntry = archive.GetEntry('package.json');
	if ( !pkgEntry ) {
		return false;
	}

	const pkg = JSON.parse(pkgEntry.Read().toString('utf8'));

	const ignore = (pkg?.sopia?.['ignore:fetch'] || []).map((i: string) => path.join(dst, i));
	console.log(`package:uncompress-buffer: ignoring list ${ignore.join(',')}`);

	archive.Entries.forEach((entry) => {
		const target = path.join(dst, entry.FullName);
		if ( fs.existsSync(target) ) {
			if ( ignore.includes(target) ) {
				return;
			}
		}
		const dirname = path.dirname(target);
		if ( !fs.existsSync(dirname) ) {
			fs.mkdirSync(dirname, { recursive: true });
		}
		entry.ExtractEntry(dirname);
	});

	evt.returnValue = true;
});