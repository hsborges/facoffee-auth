import pick from 'lodash/pick';

export const env = {
  NODE_ENV: 'dev',
  PORT: '8080',
  SUPERTOKENS_URL: 'http://localhost:3567',
  SUPERTOKENS_API_KEY: undefined,
  BASE_URL: 'http://localhost:8080',
  BASE_URL_PATH: '/auth',
  WEBSITE_URL: 'http://localhost:3000',
  WEBSITE_URL_PATH: '/auth',
};

Object.assign(env, pick(process.env, Object.keys(env)));
