import { UserService } from './../../services/user.service';
import { getServerSession } from '#auth';

export default defineEventHandler(async (_event) => {
  const { msalClient } = _event.context;

  const userService = new UserService(_event.context.prisma);

  // Look up the user's account in the cache
  const accounts = await msalClient.getTokenCache().getAllAccounts();
  const session = await getServerSession(_event);

  const user = await userService.getAzureUserById(session?.user?.id);
  const accountInfo = JSON.parse(user?.azureAccountInfo as string);

  const userAccount = accounts.find(
    (a: any) => a.homeAccountId === accountInfo.homeAccountId,
  );

  if (!userAccount) {
    return {
      success: false,
    };
  }

  try {
    await msalClient.getTokenCache().removeAccount(userAccount);
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    });
  }

  return {
    success: true,
  };
});
