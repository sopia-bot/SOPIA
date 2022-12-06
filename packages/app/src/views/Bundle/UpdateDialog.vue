<template>
	<!-- S: Dialog -->
	<v-dialog
		v-model="value"
		persistent
		max-width="450px"
		width="80%">
		<v-card>
			<v-card-title>
				<p class="ma-0" style="text-align: center; width:100%;">{{ $t('bundle.update.need') }}</p>
			</v-card-title>
			<v-container class="mb-4">
				<update-list-item
					v-for="pkg of items"
					:key="pkg.name"
					:pkg="pkg"
					:ref="pkg.name"
					@install:done="resolve"/>
			</v-container>
			<v-card-actions v-if="installDone">
				<v-spacer></v-spacer>
				<v-btn
					depressed tile dark
					:disabled="installing"
					color="indigo darken-1"
					@click="$emit('input', false)">
					{{ $t('close') }}
				</v-btn>
			</v-card-actions>
			<v-card-actions v-else>
				<v-btn
					depressed dark
					outlined
					:dark="!installing"
					:disabled="installing"
					color="red darken-1"
					@click="$emit('input', false)">
					{{ $t('close') }}
				</v-btn>
				<v-spacer></v-spacer>
				<v-btn
					depressed rounded
					:dark="!installing"
					:disabled="installing"
					:loading="installing"
					color="green darken-1"
					@click="installSelect">
					{{ $t('bundle.update.select') }}
				</v-btn>
				<v-btn
					depressed rounded
					:dark="!installing"
					:disabled="installing"
					:loading="installing"
					color="indigo darken-1"
					@click="installAll">
					{{ $t('bundle.update.all') }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- E: Dialog -->
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import BundleMixin from './bundle-mixin';
import { BundlePackage } from '@/interface/bundle';
import UpdateListItem from './UpdateListItem.vue';

@Component({
	components: {
		UpdateListItem,
	},
})
export default class BundleUpdateDialog extends Mixins(BundleMixin) {

	@Prop(Boolean) public value!: boolean;
	@Prop(Array) public items!: BundlePackage[];

	public installing: boolean = false;
	public installDone: boolean = false;
	public resolve: (value: unknown) => void = () => { /* empty */ };

	public async installAll() {
		this.installing = true;
		for (const item of this.items) {
			await this.install(item, true);
		}
		this.installDone = true;
		this.installing = false;
	}

	public async installSelect() {
		this.installing = true;
		for (const item of this.items) {
			await this.install(item);
		}
		this.installDone = true;
		this.installing = false;
	}

	private install(pkg: BundlePackage, force = false) {
		return new Promise((resolve) => {
			const [ref] = this.$refs[pkg.name] as UpdateListItem[];
			if ( ref ) {
				this.resolve = resolve;
				ref.$emit('install:start', force);
			}
		});
	}

}
</script>
