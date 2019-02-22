const redis = require('redis');
const client = redis.createClient();

module.exports = {
  client,
  useRedis: (key, next) => {
    return new Promise(resolve => {
      client.get(key, function(err, reply) {
        if (!reply || err) {
          resolve(next());
        } else {
          resolve(JSON.parse(reply));
        }
      });
    });
  },
  cacheWithKey: (key, expiration = 10) => promiseObj => {
    client.set(key, JSON.stringify(promiseObj), 'EX', expiration);
    return promiseObj;
  }
};
