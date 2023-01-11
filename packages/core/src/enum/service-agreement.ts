/*
 * service-agreement.ts
 * Created on Tue Apr 27 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

export interface ServiceAgreement {

	'service_terms': boolean;

	'personal_info_col': boolean;

	'personal_info_exp': boolean;

	'device_access': boolean;

	'marketing': boolean;

	'marketing_email': boolean;

	'night_push_agree': boolean;

	'pay_agree_for_minors': boolean;

	'voice_info_exp': boolean;

	'birth_gender_nickname_col': boolean;

	'over_fourteen_col': boolean;

	'legal_rep_playment_col': boolean;

	'legal_representative_info_col': boolean;

	'privacy_policy_col': boolean;

}
