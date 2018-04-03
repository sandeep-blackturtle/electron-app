import axios from 'axios'

import URL from '../config/'

export default class API {

    async getData() {
        const data = await axios.get(URL.url)
          .then(res => {
            const data = res.data;
            console.log('DATA:: ', data)
        })

        return data;
    }
}
