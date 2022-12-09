<template>
	<player-menu-item disable-content>
		<v-btn
			class="v-size--2x-large"
			icon dark
			color="red lighten-3"
			@click.stop="clickLike"
			:disabled="$store.state.liked">
			<v-icon>mdi-heart</v-icon>
		</v-btn>
		<p class="ma-0 text-caption white--text">{{ $t('lives.menu.like') }}</p>
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
export default class PlayerMenuLike extends Mixins(GlobalMixins) {

	@Prop(Object) public live!: Live;
	@Prop(Object) public player!: Player;

	public async clickLike() {
		const req = await window.$sopia.api.lives.setLike(this.live);
		if ( req.res.status_code !== 200 ) {
			this.$swal({
				icon: 'error',
				html: this.$t('lives.errors.fail-like'),
				toast: true,
				timer: 3000,
				position: 'top-end',
				showConfirmButton: false,
			});
		}
		this.$store.state.liked = true;
		setTimeout(() => {
			this.$store.state.liked = false;
		}, 1000 * 60 * 10);
	}

}
</script>
