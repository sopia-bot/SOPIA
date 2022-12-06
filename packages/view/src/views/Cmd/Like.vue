<template>
  <v-container>
    <v-row align="center">
      <v-col cols="12" class="px-0">
        <v-textarea
            color="indigo"
            v-model="liveLike"
            counter
            filled
            row="5"
        ></v-textarea>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import CfgLite from '@/plugins/cfg-lite-ipc';

@Component({
  components: {
  },
})
export default class CmdLike extends Mixins(GlobalMixins) {
	public liveLike: string = '';

	public cfgPath: string = this.$path('userData', 'cmd.cfg');
	public cfg: CfgLite = new CfgLite(this.cfgPath);

	public async mounted() {
		this.liveLike = this.cfg.get('live_like') || '';
		this.$evt.$on('cmd:save', () => {
			this.cfg.set('live_like', this.liveLike);
			this.cfg.save();
		});
	}

	public beforeUnmount() {
		this.$evt.$off('cmd:save');
	}

}
</script>

<style scoped>

</style>
