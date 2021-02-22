import {ILanguageKeys} from '../interfaces/i-language-keys';
import {Localization} from '../models/localization';

export type  LangType = Record<keyof ILanguageKeys, string>;
export type LocalizationMap = Record<keyof ILanguageKeys, Localization>;

export type customValidationTypes = 'ENG' | 'AR' | 'PASSPORT';

export type searchFunctionType = (text: string) => boolean;
