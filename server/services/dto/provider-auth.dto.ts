export class ProviderAuthDto {
  readonly providerName: 'google' | 'microsoft';
  readonly type: 'googledrive' | 'onedrive';
  readonly accountInfo: any | undefined;
  readonly userId: string;
  readonly accessToken: string;
  readonly refreshToken: string | undefined;
  readonly accessTokenExpiresAt: Date | undefined;
  readonly refreshTokenExpiresAt: Date | undefined;

  constructor(
    providerName: string,
    type: string,
    accountInfo: any | undefined,
    userId: string,
    accessToken: string,
    refreshToken: string | undefined,
    accessTokenExpiresAt: Date | undefined,
    refreshTokenExpiresAt: Date | undefined,
  ) {
    this.providerName = providerName;
    this.type = type;
    this.accountInfo = accountInfo;
    this.userId = userId.toLowerCase();
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.accessTokenExpiresAt = accessTokenExpiresAt;
    this.refreshTokenExpiresAt = refreshTokenExpiresAt;
  }

  static fromInput(input: {
    providerName: string;
    type: string;
    accountInfo?: any;
    userId: string;
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date;
  }): ProviderAuthDto {
    return new ProviderAuthDto(
      input.providerName,
      input.type,
      input.accountInfo,
      input.userId,
      input.accessToken,
      input.refreshToken,
      input.accessTokenExpiresAt,
      input.refreshTokenExpiresAt,
    );
  }
}
