import { KeycloakJwtPayload } from './middlewares/auth';

// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'dev' | 'prod' | 'test';
      PORT?: string;
      SUPERTOKENS_URL?: string;
      SUPERTOKENS_API_KEY?: string;
      BASE_URL?: string;
      BASE_URL_PATH?: string;
      WEBSITE_URL?: string;
      WEBSITE_URL_PATH?: string;
    }
  }
}
