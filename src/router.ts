import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import Supertokens from 'supertokens-node';
import { SessionRequest } from 'supertokens-node/framework/express';
import EmailVerification from 'supertokens-node/recipe/emailverification';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import UserMetadata from 'supertokens-node/recipe/usermetadata';

export const router = Router();

router.get('/verify-email', async (req, res, next) => {
  try {
    let { token, tenantId } = req.query;
    if (!token || !tenantId) throw new Error('Missing token or tenantId');
    const result = await EmailVerification.verifyEmailUsingToken(tenantId.toString(), token.toString());
    if (result.status === 'OK') return res.status(StatusCodes.OK).send('Email verified');
    res.status(StatusCodes.BAD_REQUEST).send(result.status);
  } catch (err) {
    next(err);
  }
});

router.get('/me', verifySession(), async (req: SessionRequest, res, next) => {
  const userId = req.session!.getUserId();
  const user = await Supertokens.getUser(userId);
  const uRes = await UserMetadata.getUserMetadata(userId);
  res.json({ ...user, metadata: uRes.metadata });
});
