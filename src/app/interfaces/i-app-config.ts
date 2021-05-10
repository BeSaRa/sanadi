export interface IAppConfig {
  VERSION: string;
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
  UNEMPLOYED_LOOKUP_KEY: number;
  QID_LOOKUP_KEY: number;
  SEARCH_YEARS_RANGE: number;
  SEARCH_YEARS_START: number;
  SEARCH_YEARS_BY: string;
  LANGUAGE_STORE_KEY: string;
  ADMIN_PERMISSIONS_GROUP: string[];
  MANAGE_ORG_PERMISSIONS_GROUP: string[];
  MANAGE_USER_PERMISSIONS_GROUP: string[];
  ORG_LOGO_EXTENSIONS: string[];
  ATTACHMENT_EXTENSIONS: string[];
}
