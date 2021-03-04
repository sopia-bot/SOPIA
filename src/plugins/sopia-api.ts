import axios from 'axios';

export class SopiaAPI {

    private jwt: string = '';
    private readonly host: string = 'http://172.17.122.222:4080';

    constructor() {
    }

    private async req(method: string, url: string, data: any = {}) {
        if ( !data['headers'] ) {
            data = { data, headers: {} };
        }
        if ( url[0] !== '/' ) {
            url = '/' + url;
        }

        data['url'] = this.host + url;
        data['method'] = method;

        if ( this.jwt ) {
            data['headers']['authorization'] = this.jwt;
        }

        const res = await axios(data);
        return res.data;
    }

    public async login(id: string, pw: string) {
        return await this.req('POST', '/auth/login/', {
            id,
            pw,
        });
    }

}