<template>
  <v-container>
    <v-row align="center">
      <v-col cols="12" class="px-0">
        <v-textarea
            color="indigo"
            v-model="liveJoin"
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
export default class CmdJoin extends Mixins(GlobalMixins) {
	public liveJoin: string = '';

	public cfgPath: string = this.$path('userData', 'cmd.cfg');
	public cfg: CfgLite = new CfgLite(this.cfgPath);

	public async mounted() {
		this.liveJoin = this.cfg.get('live_join') || '';
		this.$evt.$on('cmd:save', () => {
			this.cfg.set('live_join', this.liveJoin);
			this.cfg.save();
		});
	}

	public async beforeUnmount() {
		this.$evt.$off('cmd:save');
	}

}
</script>

<style scoped>

</style>
