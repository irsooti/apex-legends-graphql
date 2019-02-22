const axios = require('axios').default;

const apexHttpClient = axios.create({
  headers: {
    'TRN-Api-Key': process.env.TRN_Api_Key
  },
  baseURL: 'https://public-api.tracker.gg/apex/v1/standard/'
});

apexHttpClient.interceptors.response.use(resp => {
  return resp.data;
});

module.exports = apexHttpClient;
