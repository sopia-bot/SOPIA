const { NotiData } = require("sopia-core");

const SPOORCHATloading = () => {
	if ( window.VueApp['SPOORCHAT'] ) {
		return;
	}

	window.VueApp['SPOORCHAT'] = new Vue({
        el: '#voice-modal',
        methods: {
            async TCLogin() {
                const user = await TC.initLogin(this.tcEmail, this.tcPw);
                if ( user ) {
                    noti.success('로그인 성공', user.email);
                }
            },
        },
		data() {
            return {
                vtab: 'default',
                voices: speech.voices,
                tcEmail: '',
                tcPw: '',
            };
        },
	});
};