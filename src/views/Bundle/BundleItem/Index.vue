<template>
	<div class="mt-3">
		<v-hover>
			<template v-slot:default="{ hover }">
				<v-card
					:elevation="1"
					@click="detail = true;"
					min-height="120px"
					max-height="120px"
					class="pa-0">
					<v-card-text class="py-0">
						<v-row align="center" class="ma-0" style="height: 120px;">
							<v-col cols="5">
								<h3>
									{{ name }}
									<span class="text-caption mb-1 ml-auto text--secondary">^{{ pkg.version }}</span>
								</h3>
								<p class="ma-0">{{ description }}</p>
							</v-col>
							<v-col cols="2">
								{{ pkg.owner_name }}
							</v-col>
							<v-col cols="5" align="right">
								<v-btn
									v-if="pkg.page && isPackageUsing"
									:loading="loading"
									:disabled="loading"
									depressed
									class="mr-3"
									@click.stop="$assign(`/bundle/${pkg.name}/`)"
									color="primary">
									{{ $t('bundle.store.move-bundle-page') }}
								</v-btn>
								<v-btn
									v-if=!isPackageUsing
									:loading="loading"
									:disabled="loading"
									depressed outlined
									@click.stop="install">
									{{ $t('bundle.install') }}
								</v-btn>
								<v-btn
									v-else
									:loading="loading"
									:disabled="loading"
									depressed outlined
									@click.stop="uninstall"
									color="red">
									{{ $t('bundle.store.remove-bundle') }}
								</v-btn>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</template>
		</v-hover>
		<v-dialog v-model="detail" flat fullscreen persistent>
			<Detail :pkg="pkg" @close="detail = false;"/>
		</v-dialog>
	</div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import BundleMixins from '../bundle-mixin';
import { BundlePackage } from '@/interface/bundle';
import Detail from './Detail.vue';
import path from 'path';
const fs = window.require('fs');

@Component({
	components: {
		Detail,
	},
})
export default class BundleItem extends Mixins(BundleMixins) {

	@Prop(Object) public pkg!: BundlePackage;

	public isPackageUsing = false;
	public loading = false;
	public detail: boolean = false;

	public created() {
		this.updatePackageUsing();
	}

	public async install() {
		this.loading = true;
		await this.bundleInstall(this.pkg);
		this.updatePackageUsing();
		window.reloadScript();
		this.$evt.$emit('sidemenu:bundle-reload');
		this.loading = false;
	}

	public async uninstall() {
		this.loading = true;
		await this.bundleUninstall(this.pkg);
		this.updatePackageUsing();
		window.reloadScript();
		this.$evt.$emit('sidemenu:bundle-reload');
		this.loading = false;
	}

	private updatePackageUsing() {
		this.isPackageUsing = fs.existsSync(this.getBundlePath(this.pkg));
	}

}
</script>
