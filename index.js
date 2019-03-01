require('dotenv').load();
const { useRedis, cacheWithKey } = require('./cache');
const { GraphQLServer, PubSub } = require('graphql-yoga');
const apexClient = require('./api/apexHttpClient');

const resolvers = {
  Query: {
    info: (root, args) =>
      useRedis(args.name, () =>
        apexClient
          .get('/profile/5/' + args.name)
          .then(data => data.data)
          .then(cacheWithKey(args.name, 60000))
      )
  },
  ProfileType: {
    metadata: parent => {
      return { level: parent.metadata.level };
    },
    latestGames: parent => {
      return parent.children.map(child => ({
        id: child.id,
        legendName: child.metadata.legend_name,
        icon: child.metadata.icon,
        bgImage: child.metadata.bgimage,
        stats: child.stats
      }));
    }
  },
  Stats: {
    kills: parent => {
      const kills = parent.filter(stat => stat.metadata.key === 'Kills');
      return kills.length ? kills[0] : { value: -1, percentile: -1 };
    }
  },
  Subscription: {
    counter: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random()
          .toString(36)
          .substring(2, 15); // random channel name
        let count = 0;
        setInterval(
          () => pubsub.publish(channel, { counter: { count: count++ } }),
          2000
        );
        return pubsub.asyncIterator(channel);
      }
    }
  }
};

const pubsub = new PubSub();
const server = new GraphQLServer({
  typeDefs: ['./src/schema.graphql'],
  resolvers,
  context: { pubsub }
});

server.start(() =>
  console.log(`Server is running on http://localhost:4000 🤘`)
);
