export function useBreadcrumbs() {
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  const HOMEPAGE = { name: 'Home', path: '/' };
  const breadcrumbs: Ref<Array<{ name: string; path: string }>> = ref([
    HOMEPAGE,
  ]);

  function isMathPatternPath(pathA: string, pathB: string) {
    const partsA = pathA.split('/');
    const partsB = pathB.split('/');

    if (partsA.length !== partsB.length) return false;

    const isMatch = partsA.every((part: string, i: number) => {
      return part === partsB[i] || part.startsWith(':');
    });

    return isMatch;
  }

  function getBreadcrumbs(currPath: string): any[] {
    //1. When we reach the root, return the array with the Home route
    if (currPath === '') return [HOMEPAGE];

    //2. Continue building the breadcrumb for the parent's path
    const parentRoutes = getBreadcrumbs(
      currPath.slice(0, currPath.lastIndexOf('/')),
    );

    //3. Get the matching route object
    let founds = router
      .getRoutes()
      .filter((r) => isMathPatternPath(r.path, currPath));

    // if we have more than one match we want to get the exact match
    const matchRoute =
      founds.length > 1 ? founds.find((r) => r.path === currPath) : founds[0];

    //4. Get the name of the route
    const name =
      matchRoute?.meta?.breadcrumb?.label ||
      matchRoute?.name ||
      matchRoute?.path ||
      currPath;

    const result = [
      ...parentRoutes,
      {
        path: currPath,
        name: t(name),
      },
    ];

    // if result is more than 4 we want to keep
    if (result.length > 4) {
      return [
        // result[0],
        { name: '...', path: '' },
        result[2],
        result[result.length - 2],
        result[result.length - 1],
      ];
    }

    return result;
  }

  watch(
    () => ({
      path: route.path,
      name: route.name,
      meta: route.meta,
      matched: route.matched,
    }),
    (route) => {
      if (route.path === '/') return;

      breadcrumbs.value = getBreadcrumbs(route.path);
    },
    {
      immediate: true,
    },
  );

  return {
    breadcrumbs,
  };
}
