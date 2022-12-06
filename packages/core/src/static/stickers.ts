/*
 * stickers.ts
 * Created on Mon Apr 26 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

export interface Sticker {

	readonly 'name': string;

	readonly 'title': string;

	readonly 'description': string;

	readonly 'isCashout': number;

	readonly 'display': number;

	readonly 'type': number;

	readonly 'price': number;

	readonly 'color': string;

	readonly 'color_web': string;

	readonly 'tag': string;

	readonly 'image_thumbnail': string;

	readonly 'image_thumbnail_web': string;

	readonly 'image_urls': string[];

	readonly 'image_url_web': string;

	readonly 'lottie_url': string;

	readonly 'lottie_combo_url': string;

	readonly 'order': number;

	readonly 'is_used': boolean;

	readonly 'start_date': string;

	readonly 'end_date': string;

	readonly 'updated': string;

	readonly 'category': string;

}

export interface StickerCategory {

	readonly 'id': number;

	readonly 'name': string;

	readonly 'title': string;

	readonly 'is_used': boolean;

	readonly 'stickers': Sticker[];

}

export interface StaticStickers {

	readonly 'version': number;

	readonly 'updated': string;

	readonly 'categories': StickerCategory[];

}
