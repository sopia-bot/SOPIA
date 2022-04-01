<script src="../bundle-mixin.ts"></script>
<template>
	<div>
		<v-hover>
			<template v-slot:default="{ hover }">
				<v-card
					style="cursor: pointer;"
					:elevation="hover ? 12 : 1"
					tile
					@click="detail = true;"
					min-height="170px"
					max-height="170px">
					<v-card-title>
						<v-row align="end" class="ma-0">
							{{ pkg.name}}
							<span class="text-caption mb-1 ml-auto text--secondary">^{{ pkg.version }}</span>
						</v-row>
					</v-card-title>
					<v-card-subtitle>
						<p class="ma-0">{{ pkg.owner_name }}</p>
					</v-card-subtitle>
					<v-card-text class="text--primary">
						{{ pkg.description }}
					</v-card-text>
				</v-card>
			</template>
		</v-hover>
		<v-dialog v-model="detail" flat fullscreen persistent>
			<Detail :pkg="pkg"/>
		</v-dialog>
	</div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { BundlePackage } from '@/interface/bundle';
import Detail from './Detail.vue';

@Component({
	components: {
		Detail,
	},
})
export default class BundleItem extends Mixins(GlobalMixins) {

	@Prop(Object) public pkg!: BundlePackage;

	public detail: boolean = false;

}
</script>
