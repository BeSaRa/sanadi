import { Validators } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { EffectiveCoordinationInterceptor } from './../model-interceptors/effective-coordination-interceptor';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';

const { send, receive } = new EffectiveCoordinationInterceptor();

@InterceptModel({ send, receive })
export class EffectiveCoordinationCapabilities extends SearchableCloneable<EffectiveCoordinationCapabilities> implements IAuditModelProperties<EffectiveCoordinationCapabilities> {
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

  eventStartDateStamp!:number|null;

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
  getAdminResultByProperty(property: keyof EffectiveCoordinationCapabilities): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'organizationWay':
        adminResultValue = this.organizationWayInfo;
        break;
      case 'eventStartDate':
        const eventStartDateValue = DateUtils.getDateStringFromDate(this.eventStartDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: eventStartDateValue, enName: eventStartDateValue});
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
      eventTopic:{ langKey: 'lbl_event_topic', value: this.eventTopic },
      motivesAndRationale:{ langKey: 'lbl_motives_and_rationale', value: this.motivesAndRationale },
      eventObjectives:{ langKey: 'lbl_event_objectivese', value: this.eventObjectives },
      expectedOutcomes:{ langKey: 'lbl_expected_outcomes', value: this.expectedOutcomes },
      axes:{ langKey: 'lbl_axes', value: this.axes },
      eventStartDate:{ langKey: 'lbl_event_start_date', value: this.eventStartDate, comparisonValue : this.eventStartDateStamp },
      daysNumber:{ langKey: 'lbl_days_number_for_event', value: this.daysNumber },
      hoursNumber:{ langKey: 'lbl_hours_number_for_event', value: this.hoursNumber },
      organizationWay:{ langKey: 'lbl_organization_way', value: this.organizationWay },
      sponsorsAndOrganizingPartners:{ langKey: 'lbl_sponsors_and_organizing_partners', value: this.sponsorsAndOrganizingPartners },
      financialAllotment:{ langKey: 'lbl_financial_allotment', value: this.financialAllotment },
      organizationRequiredRole:{ langKey: 'lbl_organization_required_role', value: this.organizationRequiredRole },
    };
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
