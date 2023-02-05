export interface IAppConfig {
  MAP_API_KEY: string;
  VERSION: string;
  PRIVATE_VERSION: string;
  TIMESTAMP: string;
  ENVIRONMENTS_URLS: Record<string, string>;
  BASE_ENVIRONMENT: string;
  BASE_URL: string;
  API_VERSION: string;
  TOKEN_HEADER_KEY: string;
  TOKEN_STORE_KEY: string;
  EXTERNAL_PROTOCOLS: string[];
  DEFAULT_DATE_FORMAT: string;
  DATEPICKER_FORMAT: string;
  SEARCH_YEARS_RANGE: number;
  SEARCH_YEARS_START: number;
  SEARCH_YEARS_BY: string;
  LANGUAGE_STORE_KEY: string;
  CHARITY_ORG_TEAM: string;
  GIVE_USERS_PERMISSIONS: string[];// will be used to override the default forced extra permissions for user
  BENEFICIARY_AUDIT_LIMIT: number;
  E_SERVICE_ITEM_KEY: string;
  REPORTS_URL: string;
  RESET_PASSWORD: string;
  LOGIN_BACKGROUND_FALLBACK: string;
  LOGIN_BACKGROUND_INTERNAL: string;
  LOGIN_BACKGROUND_EXTERNAL: string;
  NOTIFICATIONS_URL: string;
}
