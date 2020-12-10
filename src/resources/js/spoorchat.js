let audioPlayer = null;

const SPOORCHATloading = () => {
	if ( window.VueApp['SPOORCHAT'] ) {
		return;
    }
    
    if ( loaded['spoor'] === false ) {
        setTimeout(SPOORCHATloading, 200);
        return;
    }

	window.VueApp['SPOORCHAT'] = new Vue({
        el: '#voice-modal',
        async created() {
            if ( TC.isLogin() ) {
                this.tcVoices = window.TCVoices;
                this.user = TC.getLoginAccount();
                this.voiceListReload();
            }
        },
        methods: {
            async TCLogin() {
                const user = await TC.initLogin(this.tcEmail, this.tcPw);
                if ( user ) {
                    if ( !sopia.config.spoor.typecast ) {
                        sopia.config.spoor.typecast = {
                            use: false,
                            email: '',
                            password: '',
                        };
                    }
                    sopia.config.spoor.typecast.use = true;
                    sopia.config.spoor.typecast.email = this.tcEmail;
                    sopia.config.spoor.typecast.password = this.tcPw;
                    AllSettingSave(sopia.config, null, true);

                    noti.success('로그인 성공', user.email);

                    if ( !window.TCVoices ) {
                        window.TCVoices = await TC.getVoiceList();
                    }
                    this.tcVoices = window.TCVoices;
                    this.user = user;
                    this.voiceListReload();
                }
            },
            async playTCVoice(idx) {
                if ( this.tcVoices[idx].playing == true ) {
                    this.tcVoices[idx].playing = false;
                    audioPlayer.pause();
                } else {
                    this.tcVoices[idx].playing = true;
                    audioPlayer = new Audio(this.tcVoices[idx].audio_url);
                    audioPlayer.volume = (sopia.config.spoor.ttsvolume * 0.01);
                    audioPlayer.onpause = () => {
                        this.tcVoices[idx].playing = false;
                        audioPlayer.remove();
                        audioPlayer = null;
                        this.voiceListReload();
                    }
                    audioPlayer.play();
                    this.voiceListReload();
                }
            },
            async voiceListReload() {
                this.renderer = false;
                this.$nextTick(() => {
                    this.renderer = true;
                });
            },
            async selectVoice(key) {
                const vtype = document.querySelector('#voiceType');
                vtype.dataset.type = key;

                if ( speech.voices[key] ) {
                    vtype.innerText = speech.voices[key].label;
                } else {
                    vtype.innerText = key;
                }

                sopia.config.spoor.type = key;
                UIkit.modal('#voice-modal').hide();
            },
            async selectTCVoice(idx) {
                const vtype = document.querySelector('#voiceType');
                vtype.dataset.type = 'typecast';
                vtype.dataset.tcidx = idx;
                vtype.innerText = 'T: ' + this.tcVoices[idx].name.ko;

                sopia.config.spoor.type = `typecast`;
                sopia.config.spoor.tcidx = idx;
                UIkit.modal('#voice-modal').hide();
            },
        },
		data() {
            return {
                vtab: 'default',
                voices: speech.voices,
                tcVoices: [],
                tcEmail: '',
                tcPw: '',
                user: null,
                renderer: true,
            };
        },
	});
};