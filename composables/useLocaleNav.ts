export default function useLocaleNav() {
  const localePath = useLocalePath();

  function navigateToLocale(path: string) {
    return navigateTo(localePath(path));
  }

  return {
    navigateToLocale,
  };
}
