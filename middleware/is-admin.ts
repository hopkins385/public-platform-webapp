export default defineNuxtRouteMiddleware((to, from) => {
  const { data: auth } = useAuth();
  if (!auth.value?.user.roles?.includes('admin')) {
    throw new Error('Unauthorized');
  }
});
