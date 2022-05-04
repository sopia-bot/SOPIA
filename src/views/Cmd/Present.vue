<template>
  <v-container>
    <!-- S: Present List Dialog -->
    <v-dialog
        v-model="present"
        max-width="600"
        width="80%">
      <v-card>
        <v-card-title>
          {{ $t('cmd.sticker.list') }}
        </v-card-title>
        <v-card-text>
          <v-row class="ma-0">
            <v-col
                cols="6" md="4"
                v-for="(sticker, idx) in validStickers"
                :key="sticker.name"
                @click="addPresentEvent(idx); present = false;">
              <v-hover>
                <template v-slot:default="{ hover }">
                  <v-card
                      style="cursor: pointer;"
                      :elevation="hover ? 12 : 0">
                    <v-img
                        :src="sticker.image_thumbnail"
                        class="white--text align-center"
                        :gradient="hover ? 'to bottom, rgba(0,0,0,.7), rgba(0,0,0,.7)' : ''"
                        width="100%">
                      <v-row v-if="hover" align="center">
                        <v-col cols="12" class="pb-0" align="center">
                          <h3>{{ sticker.title }}</h3>
                        </v-col>
                        <v-col cols="12" class="pt-0" align="center">
                          <v-chip color="transparent">
                            <v-img width="20px" :src="imgs.coin"/>
                            <span class="ml-2 white--text">{{ sticker.price }}</span>
                          </v-chip>
                        </v-col>
                      </v-row>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- E: Present List Dialog -->
    <v-row align="center">
      <v-col cols="12" class="px-0">
        <v-btn block tile dark color="indigo" @click="present = true;">{{ $t('add') }}</v-btn>
      </v-col>
    </v-row>
    <div class="my-6">
      <v-row class="ma-0 mt-2" v-for="(present, idx) in livePresent" :key="'present_' + present.sticker" align="center">
        <v-col class="pa-0" cols="5">
          <v-btn
              tile
              width="120px"
              color="transparent"
              depressed>
              <img
		              v-if="present.src"
		              :src="present.src"
		              width="50px"
		              :alt="present.title"/>
              {{ substr(present.title) }}
          </v-btn>
        </v-col>
        <v-col cols="5" class="pa-0">
          <v-textarea
              class="pt-0"
              hide-details
              v-model="present.message"
              rows="1"
              color="indigo darken-3"></v-textarea>
        </v-col>
        <v-col cols="2" class="pa-0 text-right">
          <v-btn icon depressed>
            <v-icon color="red darken-3" @click="delPresentEvent(idx);">mdi-close-circle</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import CfgLite from '@/plugins/cfg-lite-ipc';
import {Sticker, StickerCategory} from '@sopia-bot/core';
import giftCoin from '@/assets/gift_coin.png';

export interface PresentStruct {
	sticker: string;
	src: string;
	title: string;
	message: string;
}

@Component({
  components: {
  },
})
export default class CmdMessage extends Mixins(GlobalMixins) {
	public present: boolean = false;
	public livePresent: PresentStruct[] = [];
	public validStickers: Sticker[] = [];

	public cfgPath: string = this.$path('userData', 'cmd.cfg');
	public cfg: CfgLite = new CfgLite(this.cfgPath);

	public imgs: Record<string, unknown> = {
		coin: giftCoin,
	};

	public async mounted() {
		this.livePresent = this.cfg.get('live_present') || [{
			sticker: 'default',
			src: '',
			title: '기본',
			message: '',
		}];

		const defaultSticker = this.livePresent.find(({sticker}) => sticker === 'default');
		if ( !defaultSticker ) {
			this.livePresent.unshift({
				sticker: 'default',
				src: '',
				title: '기본',
				message: '',
			});
		}

		if ( !this.$sopia.sticker.stickers ) {
			await this.asleep(2000);
		}
		this.$sopia.sticker.stickers.categories.forEach((category: StickerCategory) => {
			if ( !category.is_used ) {
				return;
			}

			category.stickers.forEach((sticker: Sticker) => {
				if ( sticker.is_used ) {
					this.validStickers.push(sticker);
				}
			});
		});

		this.$evt.$on('cmd:save', () => {
			this.cfg.set('live_present', this.livePresent);
			this.cfg.save();
		});
	}

	public addPresentEvent(idx: number) {
		const sticker = this.validStickers[idx];
		const valid = this.livePresent.find((p: PresentStruct) => p.sticker === sticker.name);

		if ( valid ) {
			this.$swal({
				icon: 'error',
				html: this.$t('cmd.sticker.exists'),
				toast: true,
				position: 'top-end',
				timer: 3000,
				showConfirmButton: false,
				showCloseButton: false,
			});
			return;
		}
		this.livePresent.splice(1, 0, {
			sticker: sticker.name,
			title: sticker.title,
			src: sticker.image_thumbnail,
			message: '',
		});
	}

	public delPresentEvent(idx: number) {
		if ( idx === 0 ) {
			this.$swal({
				html: this.$t('cmd.rm-deferr'),
				toast: true,
				icon: 'error',
				position: 'top-end',
				showCloseButton: false,
				showConfirmButton: false,
			});
			return;
		}
		this.livePresent.splice(idx, 1);
	}

	public substr(str: string) {
		if ( str ) {
			if ( str.length > 5 ) {
				return str.substr(0, 5) + '...';
			}
		}
		return str;
	}

	public beforeUnmount() {
		this.$evt.$off('cmd:save');
	}

}
</script>

<style scoped>

</style>
