/*
 * socket.ts
 * Created on Fri Apr 30 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { User, Live, Poll, Mailbox, MailboxMessage } from '../../struct/';
import { Serializable, JsonProperty } from 'typescript-json-serializer';

@Serializable()
export class LiveSocketStruct {

	@JsonProperty() public event!: string;

	@JsonProperty() public type!: string;

	@JsonProperty() public appversion!: string;

	@JsonProperty() public useragent!: string;

	@JsonProperty() public live_id!: number;

	@JsonProperty() public rooms!: number;

	@JsonProperty() public trigger!: string;

	@JsonProperty() public data!: {};

}

@Serializable()
export class LiveStateSocket extends LiveSocketStruct {

	@JsonProperty() public user_id!: number;

	@JsonProperty() public state!: string;

	@JsonProperty() public close_status!: number;

	@JsonProperty() public is_mute!: boolean;

	@JsonProperty() public is_freeze!: boolean;

	@JsonProperty() public is_call!: boolean;

	@JsonProperty() public is_chat!: string;

	constructor() {

		super();

	}
}

@Serializable()
export class LiveLazyUpdateSocket extends LiveSocketStruct {

	@JsonProperty() public data!: {

		'live': Live;

	};

	constructor() {

		super();

	}
}

@Serializable()
export class LiveRankSocket extends LiveSocketStruct {

	@JsonProperty() public order!: {

		'now': string;

		'prev': string;

		'incrby': number;

		'effect': string;

	};

	constructor() {

		super();

	}
}

@Serializable()
export class LiveJoinSocket extends LiveSocketStruct {

	@JsonProperty() public data!: {

		'author': User;

		'live': Live;


	};

	@JsonProperty() public result!: {

		code: number;

		detail: string;

	};

	constructor() {

		super();

	}
}

@Serializable()
export class LiveUpdateSocket extends LiveSocketStruct {

	@JsonProperty() public data!: {

		'author': User;

		'live': Live;

	};

	constructor() {

		super();

	}
}

@Serializable()
export class LiveMessageSocket extends LiveSocketStruct {

	@JsonProperty() public data!: {

		'live': Live;

		'user': User;

	};

	@JsonProperty() public items!: any[]; //unknown type

	@JsonProperty() public use_item!: any[]; //unknown type

	@JsonProperty() public update_component!: {

		'message': {

			'value': string;

		};

	};

	constructor() {

		super();

	}
}

@Serializable()
export class LiveLikeSocket extends LiveSocketStruct {

	@JsonProperty() public data!: {

		'live': Live;

		'author': User;

	};

	constructor() {

		super();

	}
}

@Serializable()
export class LivePresentSocket extends LiveSocketStruct {

	@JsonProperty() public data!: {

		'amount': number;

		'author': User;

		'combo': number;

		'donation_audio': string;

		'donation_msg': string;

		'item_template_id': number;

		'live': Live;

		'sticker': string;

		'sticker_type': number;

	};

	constructor() {

		super();

	}
}

@Serializable()
export class LivePresentLikeSocket extends LiveSocketStruct {

	@JsonProperty() public data!: {

		'user': User;

	};

    // unknown property
    @JsonProperty() public items!: any[];

    @JsonProperty() public update_component!: {

        'close_air_time': string|null;

        'like': {

            'amount': number;

            'combo': number;

            'sticker': string;

            'value': number;

        };

        'listener': {

            'value': number;

        };

        'message': string|null;

        'spoon': {

            'combo': number;

            'value': number;

        };

        'total_listener': {

            'value': number;

        };

    };

    // unknown property
    'use_items'!: any[];

	constructor() {

		super();

	}
}

@Serializable()
export class LivePlaySocket extends LiveSocketStruct {

	@JsonProperty() public emit_type!: string;

	@JsonProperty() public play_type!: string;

	@JsonProperty() public poll!: Poll;

	@JsonProperty() public mailbox!: Mailbox|MailboxMessage;

	constructor() {

		super();

	}
}

@Serializable()
export class LiveRankListSocket extends LiveSocketStruct {

	@JsonProperty() public user_id!: string;

	@JsonProperty() public command!: string;

	@JsonProperty() public orders!: {

		rank: number;

		total_member_count: number;

		img_url: string;

		like_count: number;

		title: string;

		author: User;

		id: number;

		member_count: number;

	}[];

	constructor() {

		super();

	}
}


export type LiveEventStruct =
	LiveStateSocket|LiveLazyUpdateSocket|LiveRankSocket|
	LiveJoinSocket|LiveUpdateSocket|LiveMessageSocket|
	LiveLikeSocket|LivePresentSocket|LivePlaySocket|
	LiveRankListSocket|LivePresentLikeSocket;
