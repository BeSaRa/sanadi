import { Validators } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { AdminResult } from '@app/models/admin-result';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { BuildingAbilityInterceptor } from './../model-interceptors/building-ability-interceptor';
import { SearchableCloneable } from './searchable-cloneable';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';

const { send, receive } = new BuildingAbilityInterceptor();

@InterceptModel({ send, receive })
export class BuildingAbility extends SearchableCloneable<BuildingAbility> implements IAuditModelProperties<BuildingAbility> {
  organizationId!: number | undefined;
  activityName!: string;
  trainingActivityType!: number;
  activityGoal!: string;
  trainingActivityMainAxes!: string;
  trainingLanguage!: number;
  otherLanguage!: string;
  targetGroupNature!: string;
  participantsMaximumNumber!: number;
  suggestedActivityDateFrom!: string | IMyDateModel;
  suggestedActivityDateTo!: string | IMyDateModel;
  timeFrom!: string;
  timeTo!: string;
  trainingWay!: number;
  platform!: string;
  buildingsName!: string;
  floorNo!: string;
  hallName!: string;
  streetName!: string;
  filtrationMethod!: number;
  email!: string;
  otherFiltrationMethod!: string;


  trainingActivityTypeInfo!: AdminResult;
  trainingLanguageInfo!: AdminResult;
  trainingWayInfo!: AdminResult;
  filtrationMethodInfo!: AdminResult;
  otherFiltrationMethodInfo!: AdminResult;
  suggestedActivityDateFromStamp!: number | null;
  suggestedActivityDateToStamp!: number | null;


  constructor() {
    super();
    this.employeeService = FactoryService.getService('EmployeeService');
  }

  employeeService: EmployeeService;
  searchFields: ISearchFieldsMap<BuildingAbility> = {
    ...infoSearchFields([
      'trainingActivityTypeInfo',
      'trainingLanguageInfo',
      'trainingWayInfo',
    ]),
    ...normalSearchFields([
      'activityName',
      'activityGoal',
      'trainingActivityMainAxes',
      'targetGroupNature',
      'participantsMaximumNumber',
    ]),
  };
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  getAdminResultByProperty(property: keyof BuildingAbility): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'trainingActivityType':
        adminResultValue = this.trainingActivityTypeInfo;
        break;
      case 'trainingLanguage':
        adminResultValue = this.trainingLanguageInfo;
        break;
      case 'trainingWay':
        adminResultValue = this.trainingWayInfo;
        break;
      case 'filtrationMethod':
        adminResultValue = this.filtrationMethodInfo;
        break;
      case 'otherFiltrationMethod':
        adminResultValue = this.otherFiltrationMethodInfo;
        break;

      case 'suggestedActivityDateFrom':
        const suggestedActivityDateFromDateValue = DateUtils.getDateStringFromDate(this.suggestedActivityDateFrom, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: suggestedActivityDateFromDateValue, enName: suggestedActivityDateFromDateValue});
        break;
      case 'suggestedActivityDateTo':
        const suggestedActivityDateToValue = DateUtils.getDateStringFromDate(this.suggestedActivityDateTo, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: suggestedActivityDateToValue, enName: suggestedActivityDateToValue});
        break;
      case 'timeFrom':
        const timeFromValue = DateUtils.getHoursList().find(x => x.key === this.timeFrom)!.key;
        adminResultValue = AdminResult.createInstance({ arName: timeFromValue, enName: timeFromValue });
        break;
      case 'timeTo':
        const timeToValue = DateUtils.getHoursList().find(x => x.key === this.timeTo)!.key;
        adminResultValue = AdminResult.createInstance({ arName: timeToValue, enName: timeToValue });
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      activityName: { langKey: 'activity_name', value: this.activityName },
      trainingActivityType: { langKey: 'training_activity_type', value: this.trainingActivityType },
      activityGoal: { langKey: 'activity_goal', value: this.activityGoal },
      trainingActivityMainAxes: { langKey: 'lbl_training_activit_main_axes', value: this.trainingActivityMainAxes },
      trainingLanguage: { langKey: 'training_language', value: this.trainingLanguage },
      otherLanguage: { langKey: 'lbl_other_language', value: this.otherLanguage },
      targetGroupNature: { langKey: 'lbl_target_group_nature', value: this.targetGroupNature },
      participantsMaximumNumber: { langKey: 'lbl_participants_maximum_number', value: this.participantsMaximumNumber },
      suggestedActivityDateFrom: { langKey: 'lbl_suggested_activity_date_from', value: this.suggestedActivityDateFrom, comparisonValue: this.suggestedActivityDateFromStamp },
      suggestedActivityDateTo: { langKey: 'lbl_suggested_activity_date_to', value: this.suggestedActivityDateTo, comparisonValue: this.suggestedActivityDateToStamp },
      timeFrom: { langKey: 'lbl_time_from', value: this.timeFrom, },
      timeTo: { langKey: 'lbl_time_to', value: this.timeTo },
      trainingWay: { langKey: 'lbl_training_wayes', value: this.trainingWay },
      platform: { langKey: 'lbl_platform', value: this.platform },
      buildingsName: { langKey: 'lbl_building_name', value: this.buildingsName },
      floorNo: { langKey: 'lbl_floor_No', value: this.floorNo },
      hallName: { langKey: 'lbl_hall_name', value: this.hallName },
      streetName: { langKey: 'lbl_street_name', value: this.streetName },
      filtrationMethod: { langKey: 'lbl_filtration_method', value: this.filtrationMethod },
      email: { langKey: 'lbl_email', value: this.email },
      otherFiltrationMethod: { langKey: 'lbl_other_filtration_method', value: this.otherFiltrationMethod },
    };
  }
  formBuilder(controls?: boolean) {
    const {
      activityName,
      trainingActivityType,
      activityGoal,
      trainingActivityMainAxes,
      trainingLanguage,
      otherLanguage,
      targetGroupNature,
      participantsMaximumNumber,
      suggestedActivityDateFrom,
      suggestedActivityDateTo,
      timeFrom,
      timeTo,
      trainingWay,
      platform,
      buildingsName,
      floorNo,
      hallName,
      streetName,
      filtrationMethod,
      email,
      otherFiltrationMethod,
    } = this;
    return {
      activityName: controls
        ? [
          activityName,
          [Validators.required].concat(
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            )
          ),
        ]
        : activityName,
      trainingActivityType: controls
        ? [trainingActivityType, [Validators.required]]
        : trainingActivityType,
      activityGoal: controls
        ? [
          activityGoal,
          [Validators.required].concat(
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            )
          ),
        ]
        : activityGoal,
      trainingActivityMainAxes: controls
        ? [
          trainingActivityMainAxes,
          [Validators.required].concat(
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.EXPLANATIONS
            )
          ),
        ]
        : trainingActivityMainAxes,
      trainingLanguage: controls
        ? [trainingLanguage, Validators.required]
        : trainingLanguage,
      otherLanguage: controls
        ? [
          otherLanguage,
          [
            CustomValidators.minLength(2),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
            ),
          ],
        ]
        : otherLanguage,
      targetGroupNature: controls
        ? [
          targetGroupNature,
          [Validators.required].concat(
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            )
          ),
        ]
        : targetGroupNature,
      participantsMaximumNumber: controls
        ? [
          participantsMaximumNumber,
          [Validators.required].concat(
            CustomValidators.number,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
            )
          ),
        ]
        : participantsMaximumNumber,
      suggestedActivityDateFrom: controls
        ? [suggestedActivityDateFrom, Validators.required]
        : suggestedActivityDateFrom,
      suggestedActivityDateTo: controls
        ? [suggestedActivityDateTo, Validators.required]
        : suggestedActivityDateTo,
      timeFrom: controls ? [timeFrom, Validators.required] : timeFrom,
      timeTo: controls ? [timeTo, Validators.required] : timeTo,
      trainingWay: controls
        ? [trainingWay, [Validators.required]]
        : trainingWay,
      platform: controls
        ? [
          platform,
          [
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
        : platform,
      buildingsName: controls
        ? [
          buildingsName,
          [
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
        : buildingsName,
      floorNo: controls
        ? [
          floorNo,
          [
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
            ),
          ],
        ]
        : floorNo,
      hallName: controls
        ? [
          hallName,
          [
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
        : hallName,
      streetName: controls
        ? [
          streetName,
          [
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
        : streetName,
      filtrationMethod: controls
        ? [filtrationMethod, [Validators.required]]
        : filtrationMethod,
      email: controls ? [email, CustomValidators.commonValidations.email] : email,
      otherFiltrationMethod: controls
        ? [
          otherFiltrationMethod,
          [
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
        : otherFiltrationMethod,
    };
  }
  get DisplayedColumns(): string[] {
    return [
      'activityName',
      'trainingActivityType',
      'activityGoal',
      'trainingActivityMainAxes',
      'trainingLanguage',
      'targetGroupNature',
      'participantsMaximumNumber',
      'trainingWay',
      'actions',
    ];
  }
  getISOFromString(str: string | undefined) {
    const arr = str?.split(/:| /).filter(x => x !== '').map(x => x[0] === '0' ? x.substring(1) : x);
    const addition = arr ? arr[2] === 'AM' ? 0 : 12 : 0;
    const h = arr ? Number(arr[0]) + addition : 0;
    const m = arr ? Number(arr[1]) : 0;
    return new Date(new Date().setUTCHours(h, m)).toISOString();
  }
}
