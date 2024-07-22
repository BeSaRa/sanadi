import {IAppConfig} from '@contracts/i-app-config';
import {ConfigurationMergingScope} from '@app/types/types';

export const configurationMergingLevel: ConfigurationMergingScope = 'limited';

export const defaultConfiguration: Partial<IAppConfig> = {
  VERSION: 'v2.9.9',
  PRIVATE_VERSION: '',
  API_VERSION: 'v1',
  BASE_ENVIRONMENT: 'BAW_UI',
  TOKEN_HEADER_KEY: 'Authorization',
  TOKEN_STORE_KEY: '__T__',
  LANGUAGE_STORE_KEY: '__L__',
  EXTERNAL_PROTOCOLS: ['http', 'https'],
  DEFAULT_DATE_FORMAT: 'MMM D, YYYY',
  SEARCH_YEARS_RANGE: 10,
  SEARCH_YEARS_START: 2010,
  SEARCH_YEARS_BY: 'RANGE',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
  DATEPICKER_FORMAT: 'YYYY-MM-DD',
  CHARITY_ORG_TEAM: 'Charity Organization',
  GIVE_USERS_PERMISSIONS: [],
  MAP_API_KEY: 'AIzaSyAhWYKMzIKxukRQ6D0p6M3hyVZu6NqRlqo',
  BENEFICIARY_AUDIT_LIMIT: 50,
  E_SERVICE_ITEM_KEY: 'item',
  LOGIN_BACKGROUND_FALLBACK: 'login-background.png',
  LOGIN_BACKGROUND_INTERNAL: 'raca-login-background-2.jpg',
  LOGIN_BACKGROUND_EXTERNAL: 'raca-login-background-2.jpg',
  LOGIN_INSTANCE: 'EXTERNAL'
};

export const limitedConfigurableProperties: Array<keyof IAppConfig> = [
  'ENVIRONMENTS_URLS', 'BASE_ENVIRONMENT', 'REPORTS_URL', 'NAS', 'NOTIFICATIONS_URL', 'LOGIN_INSTANCE'
];

export const extendedConfigurableProperties: Array<keyof IAppConfig> = [
  'MAP_API_KEY', 'LOGIN_BACKGROUND_INTERNAL', 'LOGIN_BACKGROUND_EXTERNAL', 'GIVE_USERS_PERMISSIONS', 'SEARCH_YEARS_START', 'SEARCH_YEARS_RANGE'
];
