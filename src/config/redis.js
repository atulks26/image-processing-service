import redis from "redis-promisify";
import dotenv from "dotenv";

dotenv.config();

const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
    },
});

redisClient.on("error", (err) => console.error("Redis Error:", err));

export default redisClient;
