export default defineNuxtRouteMiddleware((to, from) => {
  const { data: auth } = useAuth();
  if (!auth.value) return;
  if (auth.value.user.onboardingDone !== true) {
    // Redirect to onboarding if page is not onboarding
    if (to.path !== '/onboarding' && to.path !== '/login' && to.path !== '/logout') {
      return '/onboarding';
    }
  } else if (to.path === '/onboarding') {
    return '/';
  }
});
