import { ILanguageKeys } from '@contracts/i-language-keys';
import { Localization } from '@models/localization';
import { IAngularMyDpOptions } from 'angular-mydatepicker';
import { AbstractControl } from '@angular/forms';
import { ITabData } from '@app/interfaces/i-tab-data';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {PermissionsEnum} from '@app/enums/permissions-enum';
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';

export type LangType = Record<keyof ILanguageKeys, string>;
export type LocalizationMap = Record<keyof ILanguageKeys, Localization>;

export type PermissionGroupsMapType = { [key in PermissionGroupsEnum]: (PermissionsEnum[] | EServicePermissionsEnum[] | string[]) };
export type PermissionGroupsMapResponseType = (PermissionsEnum[] | EServicePermissionsEnum[] | string[]);

export type ConfigurationMergingScope = 'limited' | 'extended' | 'open';
export type LoginInstances = 'EXTERNAL' | 'INTERNAL' | 'BOTH';

export type customValidationTypes =
  'ENG_NUM'
  | 'AR_NUM'
  | 'ENG_ONLY'
  | 'AR_ONLY'
  | 'ENG_NUM_ONLY'
  | 'AR_NUM_ONLY'
  | 'ENG_NUM_ONE_ENG'
  | 'AR_NUM_ONE_AR'
  | 'ENG_AR_ONLY'
  | 'ENG_AR_NUM_ONLY'
  | 'ENG_NO_SPACES_ONLY'
  | 'PASSPORT'
  | 'EMAIL'
  | 'NUM_HYPHEN_COMMA'
  | 'PHONE_NUMBER'
  | 'WEBSITE'
  | 'URL'
  | 'HAS_LETTERS'
  ;

export type searchFunctionType<T = any> = (text: string, model: T) => boolean;

export type CanNavigateOptions = 'ALLOW' | 'DISALLOW' | 'CONFIRM_UNSAVED_CHANGES';

export type BulkOperationTypes = 'DELETE' | 'UPDATE' | 'SAVE';

export type BulkResponseTypes = 'SUCCESS' | 'FAIL' | 'PARTIAL_SUCCESS' | 'NONE';

export type DeleteBulkResult<T = any> = { result: BulkResponseTypes, fails: T[], success: T[] };

export type FilterEventTypes = 'OPEN' | 'CLEAR' | 'RESET';

export type ISearchFieldsMap<T = any> = { [key: string]: (string | searchFunctionType<T>) };

export type ReadinessStatus = 'READY' | 'NOT_READY';

export type DatepickerOptionsMap = { [key: string]: IAngularMyDpOptions };

export type DatepickerControlsMap = { [key: string]: AbstractControl };
export type TabMap = { [key: string]: ITabData };


type info = 'Info';
type InfoProperty<T> = T extends `${infer S}${info}` ? T : never;
export type OnlyInfoProperty<T> = {
  [P in InfoProperty<keyof T>]: T[P]
}


export type GridName = string
export type ItemId = string

export type FollowUpDateModels = ForeignCountriesProjects | CharityOrganizationUpdate;

export type FieldControlAndLabelKey = { control: AbstractControl, labelKey: keyof ILanguageKeys };
