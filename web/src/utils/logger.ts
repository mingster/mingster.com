import pino, { type Logger } from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger: Logger = isProduction
	? // JSON in production
		pino({ level: "warn" })
	: // Pretty print in development
		pino({
			/*
		browser: {
			asObject: true,
			write: (o) => {
				console.log(JSON.stringify(o));
			},
		},*/
			transport: {
				target: "pino-pretty",
				options: {
					colorize: true, // Enables colored output
					//translateTime: true, // Adds timestamps
					//ignore: "pid,hostname", // Removes unnecessary fields
				},
				/*
			target: "pino-logflare",
			options: {
				sourceToken: process.env.LOGFLARE_SOURCE_TOKEN as string,
			},
			*/
			},
			level: "debug",
		});

export default logger;

/*
import pino from "pino";


const logger = pino({
	level: isProduction ? "info" : "debug",
	browser: {
		asObject: true,
		write: (o) => {
			console.log(JSON.stringify(o));
		},
	},
	// Configure for both environments without worker threads
	transport: {
		target: isProduction ? "pino" : "pino-pretty",
		options: {
			colorize: true, // Enables colored output
			translateTime: true, // Adds timestamps
			ignore: "pid,hostname", // Removes unnecessary fields
		},
	},
});

export default logger;

*/
