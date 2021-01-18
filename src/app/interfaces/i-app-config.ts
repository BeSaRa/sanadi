export interface IAppConfig {
  ENVIRONMENTS_URLS: string [];
  BASE_ENVIRONMENT_INDEX: number;
  BASE_URL: string;
  API_VERSION: string;
  TOKEN_HEADER_KEY: string;
  TOKEN_STORE_KEY: string;
  EXTERNAL_PROTOCOLS: string[];
}
