import type { AccountInfo as AzureAccountInfo } from '@azure/msal-common';

export interface AzureAuthTokens {
  accountInfo: AzureAccountInfo;
  accessToken: string;
  refreshToken?: string;
}

/* export type AccountInfo = {
  homeAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  localAccountId: string;
  name?: string;
  idToken?: string;
  idTokenClaims?: TokenClaims & {
      [key: string]: string | number | string[] | object | undefined | unknown;
  };
  nativeAccountId?: string;
  authorityType?: string;
  tenantProfiles?: Map<string, TenantProfile>;
};

*/
