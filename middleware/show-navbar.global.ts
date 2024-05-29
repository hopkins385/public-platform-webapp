export default defineNuxtRouteMiddleware((to, from) => {
  // if navigated away from a workflow which has the route
  // /projects/[projectId]/workflows/[workflowId]
  // and the navbar is fully closed, open it
  const navBar = useNavBarStore();
  if (
    from.name === 'projects-projectId-workflows-workflowId' &&
    to.name !== 'projects-projectId-workflows-workflowId'
  ) {
    if (navBar.isFullClosed) {
      navBar.toggleFullClosed();
    }
  }
});
