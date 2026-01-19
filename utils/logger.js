/* eslint-disable no-console */
const isPlainObject = (value) =>
  Boolean(value) &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !(value instanceof Error);

const normalizeValue = (value) => {
  if (value instanceof Error) {
    return { error: value.message, stack: value.stack };
  }

  if (isPlainObject(value)) {
    return value;
  }

  return { value };
};

const buildMeta = (args) => {
  if (!args.length) {
    return undefined;
  }

  if (args.length === 1 && isPlainObject(args[0])) {
    return args[0];
  }

  return { details: args.map(normalizeValue) };
};

const log = (level, message, ...args) => {
  const meta = buildMeta(args);
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ?? {}),
  };

  console.log(JSON.stringify(entry));
};

export const logger = {
  info: (message, ...args) => log('info', message, ...args),
  warn: (message, ...args) => log('warn', message, ...args),
  error: (message, ...args) => log('error', message, ...args),
};
