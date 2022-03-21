<template>
  <v-container>
    <v-row align="center">
      <v-col cols="12" class="px-0">
        <v-btn block tile dark color="indigo" @click="addMessageEvent">{{ $t('add') }}</v-btn>
      </v-col>
    </v-row>
    <v-row class="ma-0" align="center" v-for="(message, idx) in liveMessage" :key="'message_' + message.cmd + idx">
      <v-col cols="3" class="pa-0">
        <v-text-field
            :placeholder="$t('cmd.command')"
            color="indigo darken-3"
            v-model="message.command"/>
      </v-col>
      <v-col cols="6" class="py-0">
        <v-textarea
            :placeholder="$t('cmd.reply')"
            color="indigo darken-3"
            rows="1"
            v-model="message.message"/>
      </v-col>
      <v-col cols="2" class="pa-0">
        <v-select
          :items="permitList"
          color="indigo darken-3"
          v-model="message.permit"
          item-text="text"
          item-value="value">
          <template v-slot:selection="{ item }">
            {{ $t('cmd.permit.' + item.value) }}
          </template>
        </v-select>
      </v-col>
      <v-col cols="1" class="pa-0 text-right">
        <v-btn icon depressed>
          <v-icon color="red darken-3" @click="delMessageEvent(idx);">mdi-close-circle</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import CfgLite from '@/plugins/cfg-lite-ipc';

export interface MessageStruct {
	command: string;
	message: string;
	permit: string;
}

interface PermitItem {
	text: string;
	value: string;
}

@Component({
  components: {
  },
})
export default class CmdMessage extends Mixins(GlobalMixins) {
	public liveMessage: MessageStruct[] = [];

	public cfgPath: string = this.$path('userData', 'cmd.cfg');
	public cfg: CfgLite = new CfgLite(this.cfgPath);

	public readonly permitList: PermitItem[] = [
		{
			text: this.$t('cmd.permit.all'),
			value: 'all',
		},
		{
			text: this.$t('cmd.permit.manager'),
			value: 'manager',
		},
	];

	public mounted() {
		this.liveMessage = this.cfg.get('live_message') || [];
		this.$evt.$on('cmd:save', () => {
			this.cfg.set('live_message', this.liveMessage);
			this.cfg.save();
		});
	}

	public addMessageEvent() {
		this.liveMessage.push({
			command: '',
			message: '',
			permit: 'all',
		});
	}

	public delMessageEvent(idx: number) {
		this.liveMessage.splice(idx, 1);
	}

	public beforeUnmount() {
		this.$evt.$off('cmd:save');
	}
}
</script>

<style scoped>

</style>
