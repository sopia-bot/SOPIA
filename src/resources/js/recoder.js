const { dialog } = require('electron').remote;
const { ipcRenderer } = require('electron');
const fs = require('fs');

/**
* @type {Object}
* 좌측 하단에 정보를 띄웁니다.
*/
const noti = {
    error : (errString) => {
        UIkit.notification({
            message: '<span uk-icon="icon: close"></span>&nbsp;'+
            '<label class="uk-text-small">에러 : <span class="uk-text-danger">' + errString + '</span></label>',
            pos: 'bottom-left'
        });
        console.error(errString);
    },
    success : (title, message) => {
        UIkit.notification({
            message: '<span uk-icon="icon: check"></span>&nbsp;'+
            `<label class="uk-text-small">${title} : <span class="uk-text-success">${message}</span></label>`,
            pos: 'bottom-left'
        });
    },
    info : (title, message) => {
        UIkit.notification({
            message: '<span uk-icon="icon: plus-circle"></span>&nbsp;'+
            `<label class="uk-text-small">${title} : <span class="uk-text-spoon">${message}</span></label>`,
            pos: 'bottom-left'
        });
    }
};

navigator.mediaDevices.getUserMedia({ audio: true }).
    then(localMediaStream => {
        const mediaRecorder = new MediaRecorder(localMediaStream);
        const FReader = new FileReader();
        let audioChunk = [];
        
        let isRun = false;
        let audioBlob = null;
        let audioUrl = null;
        let audioStream = null;
        
        
        const startRecord = document.querySelector('#start-record');
        startRecord.addEventListener('click', (evt) => {
            if ( isRun === false ) {
                audioBlob = null;
                audioUrl = null;
                audioStream = null;
                audioChunk = [];
                
                startRecord.classList.add('uk-text-danger');
                mediaRecorder.start();
                
                isRun = true;
            } else {
                // is playing. stop
                isRun = false;
                startRecord.classList.remove('uk-text-danger');
                mediaRecorder.stop();
            }
        });
        
        mediaRecorder.addEventListener('dataavailable', (evt) => {
            audioChunk.push(event.data);
        });
        
        mediaRecorder.addEventListener('stop', (evt) => {
            audioBlob = new Blob(audioChunk, {type: 'audio/mp3'});
            audioUrl = URL.createObjectURL(audioBlob);
        });
        
        let isPlaying = false;
        const playRecord = document.querySelector('#play-record');
        playRecord.addEventListener('click', (evt) => {
            if ( !audioUrl ) {
                noti.error('오디오 컨텐츠가 없습니다.');
                return;
            }
            
            if ( isPlaying === false ) {
                const audio = new Audio(audioUrl);
                audio.play();
                audio.onpause = () => {
                    isPlaying = false;
                    
                    playRecord.classList.remove('uk-text-warning');
                    audio.remove();
                    delete audio;
                };
                
                playRecord.classList.add('uk-text-warning');
                isPlaying = true;
            } else {
                isPlaying = false;
                playRecord.classList.remove('uk-text-warning');
            }
        });
        
        document.querySelector('#save-record').addEventListener('click', (evt) => {
            if ( !audioBlob ) {
                noti.error('오디오 컨텐츠가 없습니다.');
                return;
            }
            
            const saveFile = dialog.showSaveDialog({
                title: '시그니처 저장',
                filters: [
                    { name: 'base64 Audio', extensions: ['base64']}
                ]
            });
            
            //FReader.readAsBinaryString(audioBlob);
            FReader.readAsDataURL(audioBlob);
            FReader.onloadend = () => {
                fs.writeFile(saveFile, FReader.result, (err, data) => {
                    if ( err ) {
                        console.error(err);
                        return;
                    }
                    ipcRenderer.send('RecordReturnValue', saveFile);
                    window.close();
                });
            }
        });
    });