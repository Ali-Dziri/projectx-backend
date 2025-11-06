export type TokenGenerationPayload = {
  email: string;
  sub: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
};
