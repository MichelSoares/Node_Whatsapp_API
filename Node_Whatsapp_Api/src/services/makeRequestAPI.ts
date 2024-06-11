import axios from 'axios';
import FormData from 'form-data';

interface QueryParameters {
  [key: string]: string;
}

class makeRequestAPI{
  static async makeRequestSimple(endpoint: string, queryParams: string | QueryParameters): Promise<any> {
    let queryString = '';

    if (typeof queryParams === 'string') {
        queryString = queryParams;
    } else {
        queryString = Object.entries(queryParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
    }

    const url = `${process.env.URL_NODEPG_WS}?${endpoint}&${queryString}`;

    try {
        const formData = new FormData();
        formData.append('token', 'ZZczm9FGSFzzEEjAT4N78u');

        const headers = {
            ...formData.getHeaders(),
            'User-Agent': 'NODEPG'
        };

        const response = await axios.post(url, formData, { headers });
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
  }

  static async makeRequestBody(endpoint: string, jsonData: any): Promise<any> {
    const url = `${process.env.URL_NODEPG_WS}${endpoint}.php`;
    
    try {
        const headers = {
            'User-Agent': 'NODEPG',
            'Content-Type': 'application/json',
            'Token': 'ZZczm9FGSFzzEEjAT4N78u'
        };
        //console.log('OBJETO antes da request: ' + JSON.stringify(jsonData))

        const response = await axios.post(url, jsonData, { headers });
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
  }
}

export { makeRequestAPI }