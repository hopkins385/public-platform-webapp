// extend the route meta to include the breadcrumb label
import { RouteMeta } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumb: {
      label: string;
      icon?: string;
    };
  }
}
