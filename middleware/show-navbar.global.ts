export default defineNuxtRouteMiddleware((to, from) => {
  // if navigated away from a workflow which has the route
  // /projects/[projectId]/workflows/[workflowId]
  // and the navbar is not fully closed, close it
  // otherwise, open it, if it is fully closed
  const navBar = useNavBarStore();

  if (to.name === 'projects-projectId-workflows-workflowId') {
    if (!navBar.isFullClosed) navBar.toggleFullClosed();
  } else if (navBar.isFullClosed) {
    navBar.toggleFullClosed();
  }
});
