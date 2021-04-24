let audioPlayer = null;

const createRandSel = () => {
    const randsel = [];
    for ( const [key, val] of Object.entries(speech.voices) ) {
        randsel.push({
            type: 'default',
            val: key,
            label: val.label,
            use: false,
        });
    }

    if ( sopia.config.spoor.typecast && sopia.config.spoor.typecast.use ) {
        TCVoices.forEach((voice, idx) => {
            if ( voice.language === 'ko-kr' ) {
                randsel.push({
                    type: 'typecast',
                    val: idx,
                    label: voice.name.ko,
                    use: false,
                });
            }
        });
    }
    return randsel;
}

const SPOORCHATloading = () => {
	if ( window.VueApp['SPOORCHAT'] ) {
		return;
    }
    
    if ( loaded['spoor'] === false ) {
        setTimeout(SPOORCHATloading, 200);
        return;
    }

    const newRandSel = createRandSel();
    if ( !sopia.config.spoor.randsel ) {
        sopia.config.spoor.randsel = newRandSel;
    } else if ( sopia.config.spoor.randsel.length != newRandSel.length ) {
        sopia.config.spoor.randsel.forEach((r, idx) => {
            newRandSel.use = r.use;
        });
        sopia.config.spoor.randsel = newRandSel;
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
            async apply() {
                if ( this.vtab === 'random' ) {
                    const vtype = document.querySelector('#voiceType');
                    vtype.dataset.type = 'random';
                    vtype.innerText = '랜덤';

                    sopia.config.spoor.type = 'random';
                    sopia.config.spoor.randsel = this.randsel;
                    UIkit.modal('#voice-modal').hide();
                }
            },
            isAllSel() {
                for ( let i = 0;i < this.randsel.length;i++ ) {
                    if ( !this.randsel[i].use ) {
                        return false;
                    }
                }
                return true;
            },
            allSelect() {
                let val = true;
                if ( this.isAllSel() ) {
                    val = false;
                }
                for ( let i = 0;i < this.randsel.length;i++ ) {
                    this.randsel[i].use = val;
                }
                this.voiceListReload();
            }
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
                randAll: false,
                randsel: sopia.config.spoor.randsel,
            };
        },
	});
};

const printSpoorHelp = () => {
	if ( sopia.live ) {
		if ( sopia.config && sopia.config.spoor && sopia.config.spoor.enable ) {
			const list = sopia.config.spoor.randsel.map(r => r.label);
			sopia.send(`Spoorchat사용할 때 민지/내용 형태로 입력하시면 해당 성우의 목소리를 사용할 수 있습니다.\n예) 민지/안녕하세요.`);
			sopia.send(`사용 가능한 목소리: ${list.join(', ')}`);
		}
	}
}

sopia.itv.clear('spoorchat-noti');
sopia.itv.add('spoorchat-noti', printSpoorHelp, 1000 * 60 * 10);