import { BuildingAbilityInterceptor } from './../model-interceptors/building-ability-interceptor';
import { Validators } from '@angular/forms';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { AdminResult } from '@app/models/admin-result';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { IMyDateModel } from 'angular-mydatepicker';

const { send, receive } = new BuildingAbilityInterceptor();

@InterceptModel({ send, receive })
export class BuildingAbility extends SearchableCloneable<BuildingAbility> {
  organizationId!: number | undefined;
  activityName!: string;
  trainingActivityType!: number;
  activityGoal!: string;
  trainingActivityMainAxes!: string;
  trainingLanguage!: number;
  otherLanguage!: string;
  targetGroupNature!: string;
  participantsMaximumNumber!: number;
  suggestedActivityDateFrom!: string| IMyDateModel;
  suggestedActivityDateTo!: string| IMyDateModel;
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

  constructor() {
    super();
    this.employeeService = FactoryService.getService('EmployeeService');
  }

  employeeService: EmployeeService;
  searchFields: ISearchFieldsMap<BuildingAbility> = {
    ...dateSearchFields([
      'suggestedActivityDateFrom',
      'suggestedActivityDateTo',
    ]),
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
      'timeFrom',
      'timeTo',
      'platform',
      'buildingsName',
      'floorNo',
      'hallName',
      'streetName',
      'email',
    ]),
  };
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
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
                CustomValidators.defaultLengths.SWIFT_CODE_MAX
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
                CustomValidators.defaultLengths.SWIFT_CODE_MAX
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
                CustomValidators.defaultLengths.SWIFT_CODE_MAX
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
      email: controls
        ? [
            email,
            [Validators.email].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.EMAIL_MAX
              )
            ),
          ]
        : email,
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
      'suggestedActivityDateFrom',
      'suggestedActivityDateTo',
      'timeFrom',
      'timeTo',
      'trainingWay',
      'actions',
    ];
  }
}
