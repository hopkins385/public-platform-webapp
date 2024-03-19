import { TRPCClientError } from '@trpc/client';

export default function useRegister() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  onScopeDispose(() => {
    ac.abort();
  });

  function register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    terms: boolean;
  }) {
    return useAsyncData(async () => {
      try {
        return await $client.register.newUser.query(
          {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            password: payload.password,
            terms: payload.terms,
          },
          {
            signal: ac.signal,
          },
        );
      } catch (error) {
        if (error instanceof TRPCClientError) {
          const emailError = error?.data?.zodError?.fieldErrors?.email[0];
          throw emailError || error.message;
        } else {
          throw error;
        }
      }
    });
  }

  function confirmEmail(payload: { userId: string; token: string }) {
    return useAsyncData(async () => {
      return await $client.register.confirmEmail.query(
        {
          userId: payload.userId,
          token: payload.token,
        },
        {
          signal: ac.signal,
        },
      );
    });
  }

  return {
    register,
    confirmEmail,
  };
}
