import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import Supertokens from 'supertokens-node';
import { SessionRequest } from 'supertokens-node/framework/express';
import EmailVerification from 'supertokens-node/recipe/emailverification';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import UserMetadata from 'supertokens-node/recipe/usermetadata';

export const router = Router();

router.get('/me', verifySession(), async (req: SessionRequest, res, next) => {
  const userId = req.session!.getUserId();
  const user = await Supertokens.getUser(userId);
  const uRes = await UserMetadata.getUserMetadata(userId);
  res.json({ ...user, metadata: uRes.metadata });
});
