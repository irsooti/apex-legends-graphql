require('dotenv').load();
const { useRedis, cacheWithKey } = require('./cache');
const { GraphQLServer } = require('graphql-yoga');
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
        bgImage: child.metadata.bgimage
      }));
    }
  },
  Stats: {
    kills: parent => {
      const kills = parent.filter(stat => stat.metadata.key === 'Kills');
      return kills.length ? kills[0] : null;
    }
  }
};

const server = new GraphQLServer({
  typeDefs: ['./src/schema.graphql'],
  resolvers
});

server.start(() => console.log(`Server is running on http://localhost:4000 🤘`));
