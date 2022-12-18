import { getLogger, handlers, setup } from "./deps/log.ts";

setup({
  handlers: {
    console: new handlers.ConsoleHandler("NOTSET"),
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console"],
    },
    verbose: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});

export const logger = getLogger();
export const verboseLogger = getLogger("verbose");
