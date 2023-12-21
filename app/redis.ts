import { RedisClientType, createClient } from 'redis';

export let redisClient: RedisClientType;

(async () => {
  redisClient = createClient({
    socket: {
      port: 6379,
      host: 'redis',
    },
  });
  redisClient.on('error', (error: Error) => console.error(`Error : ${error}`));
  redisClient.on('connect', () => console.log('Redis connected'));
  await redisClient.connect();
})();
