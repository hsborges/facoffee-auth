import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import Supertokens from 'supertokens-node';
import { errorHandler, middleware } from 'supertokens-node/framework/express';
import Dashboard from 'supertokens-node/recipe/dashboard';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import EmailVerification from 'supertokens-node/recipe/emailverification';
import Session from 'supertokens-node/recipe/session';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import UserRoles from 'supertokens-node/recipe/userroles';

import { env } from './env';
import { router } from './router';

Supertokens.init({
  framework: 'express',
  supertokens: {
    connectionURI: env.SUPERTOKENS_URL,
    apiKey: env.SUPERTOKENS_API_KEY,
  },
  appInfo: {
    appName: 'FACOFFEE',
    apiDomain: env.BASE_URL,
    websiteDomain: env.WEBSITE_URL,
    apiBasePath: env.BASE_URL_PATH,
    websiteBasePath: env.WEBSITE_URL_PATH,
  },
  recipeList: [
    EmailPassword.init({
      signUpFeature: {
        formFields: [
          {
            id: 'email',
            async validate(value) {
              return value.endsWith('@ufms.br') ? undefined : 'Only @ufms.br emails are allowed';
            },
          },
          { id: 'password' },
          { id: 'first_name' },
          { id: 'last_name' },
        ],
      },
      override: {
        apis(originalImplementation) {
          return {
            ...originalImplementation,
            async signUpPOST(input) {
              if (originalImplementation.signUpPOST === undefined) {
                throw Error('Should never come here');
              }

              const response = await originalImplementation.signUpPOST(input);

              if (response.status !== 'OK') return response;

              const { email, password, ...metadata } = input.formFields.reduce(
                (memo: Record<string, any>, value) => ({ ...memo, [value.id]: value.value }),
                {},
              );

              await UserMetadata.updateUserMetadata(response.user.id, metadata);

              await EmailVerification.sendEmailVerificationEmail(
                response.session.getTenantId(),
                response.user.id,
                response.session.getRecipeUserId(),
              );

              return response;
            },
          };
        },
      },
    }), // initializes signin / sign up features
    Session.init({
      override: {
        functions(originalImplementation) {
          return {
            ...originalImplementation,
            async createNewSession({ accessTokenPayload, ...input }) {
              return originalImplementation.createNewSession({
                ...input,
                accessTokenPayload: {
                  iss: accessTokenPayload.iss,
                  roles: accessTokenPayload['st-role'].v,
                  email_verified: accessTokenPayload['st-ev'].v,
                },
              });
            },
          };
        },
      },
    }), // initializes session features
    Dashboard.init(), // initializes dashboard features
    UserRoles.init(), // initializes user roles features
    UserMetadata.init(), // initializes user metadata features
    EmailVerification.init({ mode: 'REQUIRED' }),
  ],
});

let app = express();

if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'prod' ? 'tiny' : 'dev'));
app.use(
  cors({ origin: true, allowedHeaders: ['content-type', ...Supertokens.getAllCORSHeaders()], credentials: true }),
);

app.use(middleware());
app.use(env.BASE_URL_PATH, router);

app.use(errorHandler());

app.listen(env.PORT, () => console.log(`listening on port ${env.PORT}`));
