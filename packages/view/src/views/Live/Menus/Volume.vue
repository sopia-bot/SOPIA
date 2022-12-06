<template>
	<player-menu-item>
		<v-btn class="v-size--2x-large" icon dark color="orange">
			<v-icon>mdi-volume-high</v-icon>
		</v-btn>
		<p class="ma-0 text-caption white--text">{{ $t('lives.menu.volume') }}</p>
		<template v-slot:menu>
			<v-row class="ma-0" align="center" style="height: 100%;">
				<v-col cols="2" offset="2" class="pa-0">
					<v-btn icon dark @click="toggleMute">
						<v-icon v-if="volume > 0 && !isMute">mdi-volume-high</v-icon>
						<v-icon v-else>mdi-volume-off</v-icon>
					</v-btn>
				</v-col>
				<v-col cols="6" class="pa-0">
					<v-slider
						dark
						v-model="volume"
						width="200px"
						:disabled="isMute"
						tick-size="1"
						hide-details
						inverse-label
						@input="onChange"
						:label="volume.toString()"></v-slider>
				</v-col>
			</v-row>
		</template>
	</player-menu-item>
</template>
<style scoped>
.v-btn--icon.v-size--2x-large {
    height: 62px;
    width: 62px;
}

.v-btn--icon.v-size--2x-large .v-icon, .v-btn--fab.v-size--2x-large .v-icon {
    height: 42px;
    font-size: 42px;
    width: 42px;
}

.v-btn.v-size--2x-large {
    font-size: 1.2rem;
}

</style>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import PlayerMenuItem from './PlayerMenuItem.vue';
import { Live } from '@sopia-bot/core';
import { Player } from '../player';

@Component({
	components: {
		PlayerMenuItem,
	},
})
export default class PlayerMenuVolume extends Mixins(GlobalMixins) {

	@Prop(Object) public live!: Live;
	@Prop(Object) public player!: Player;
	public volume: number = this.$cfg.get('player.volume') ?? 50;
	public isMute: boolean = this.$cfg.get('player.isMute') ?? false;
	public timer!: NodeJS.Timer;

	public onChange() {
		if ( this.player ) {
			this.player.volume = this.volume * 0.01;
		}
		if ( this.timer ) {
			clearTimeout(this.timer);
		}

		this.timer = setTimeout(() => {
			this.$cfg.set('player.volume', this.volume);
			this.$cfg.save();
		}, 500);
	}

	public toggleMute() {
		this.isMute = !this.isMute;
		if ( this.player ) {
			if ( this.isMute ) {
				this.player.volume = 0;
			} else {
				this.player.volume = this.volume * 0.01;
			}
		}
		this.$cfg.set('player.isMute', this.isMute);
		this.$cfg.save();
	}

}
</script>
