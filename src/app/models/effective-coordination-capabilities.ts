import { Validators } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { EffectiveCoordinationInterceptor } from './../model-interceptors/effective-coordination-interceptor';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';

const { send, receive } = new EffectiveCoordinationInterceptor();

@InterceptModel({ send, receive })
export class EffectiveCoordinationCapabilities extends SearchableCloneable<EffectiveCoordinationCapabilities> {
  organizationId!: number | undefined;
  eventTopic!: string;
  motivesAndRationale!: string;
  eventObjectives!: string;
  expectedOutcomes!: string;
  axes!: string;
  eventStartDate!: string | IMyDateModel;
  daysNumber!: number;
  hoursNumber!: number;
  organizationWay!: number;
  sponsorsAndOrganizingPartners!: string;
  financialAllotment!: number;
  organizationRequiredRole!: string;
  organizationWayInfo!: AdminResult;
  langService?: LangService;

  constructor() {
    super();

    this.employeeService = FactoryService.getService('EmployeeService');
    this.langService = FactoryService.getService('LangService');
  }

  employeeService: EmployeeService;
  searchFields: ISearchFieldsMap<EffectiveCoordinationCapabilities> = {
    ...infoSearchFields(['organizationWayInfo']),
    ...normalSearchFields([
      'eventTopic',
      'motivesAndRationale',
      'eventObjectives',
      'expectedOutcomes',
      'axes',
      'daysNumber',
      'hoursNumber',
      'sponsorsAndOrganizingPartners',
      'financialAllotment',
      'organizationRequiredRole',
    ]),
  };
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  get DisplayedColumns(): string[] {
    return [
      'eventTopic',
      'motivesAndRationale',
      'eventObjectives',
      'expectedOutcomes',
      'axes',
      'daysNumber',
      'hoursNumber',
      'organizationWay',
      'sponsorsAndOrganizingPartners',
      'financialAllotment',
      'organizationRequiredRole',
      'actions',
    ];
  }
  BuildForm(controls?: boolean) {
    const {
      eventTopic,
      motivesAndRationale,
      eventObjectives,
      expectedOutcomes,
      axes,
      eventStartDate,
      daysNumber,
      hoursNumber,
      organizationWay,
      sponsorsAndOrganizingPartners,
      financialAllotment,
      organizationRequiredRole,
    } = this;
    return {
      eventTopic: controls
        ? [
            eventTopic,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : eventTopic,
      motivesAndRationale: controls
        ? [
            motivesAndRationale,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : motivesAndRationale,
      eventObjectives: controls
        ? [
            eventObjectives,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : eventObjectives,
      expectedOutcomes: controls
        ? [
            expectedOutcomes,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : expectedOutcomes,
      axes: controls
        ? [
            axes,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : axes,
      eventStartDate: controls
        ? [eventStartDate, [Validators.required]]
        : eventStartDate,
      daysNumber: controls
        ? [
            daysNumber,
            [Validators.required].concat(
              CustomValidators.number,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
              )
            ),
          ]
        : daysNumber,
      hoursNumber: controls
        ? [
            hoursNumber,
            [Validators.required].concat(
              CustomValidators.number,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
              )
            ),
          ]
        : hoursNumber,
      organizationWay: controls
        ? [organizationWay, [Validators.required]]
        : organizationWay,
      sponsorsAndOrganizingPartners: controls
        ? [
            sponsorsAndOrganizingPartners,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : sponsorsAndOrganizingPartners,
      financialAllotment: controls
        ? [
            financialAllotment,
            [Validators.required].concat(
              CustomValidators.decimal(
                CustomValidators.defaultLengths.DECIMAL_PLACES
              ),
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
              )
            ),
          ]
        : financialAllotment,
      organizationRequiredRole: controls
        ? [
            organizationRequiredRole,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : organizationRequiredRole,
    };
  }
}
