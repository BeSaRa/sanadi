import { ISearchFieldsMap, ControlValueLabelLangKey } from './../types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from '@app/models/admin-result';
import { InterventionField } from './intervention-field';
import { InterventionRegion } from './intervention-region';
import { ImplementingAgency } from './implementing-agency';
import { FactoryService } from '@services/factory.service';
import {
  UrgentInterventionFinancialNotificationService
} from '@services/urgent-intervention-financial-notification.service';
import { LicenseApprovalModel } from '@app/models/license-approval-model';
import { CaseTypes } from '../enums/case-types.enum';
import {
  UrgentInterventionFinancialNotificationInterceptor
} from '@app/model-interceptors/urgent-intervention-financial-notification-interceptor';
import { InterceptModel } from '@decorators/intercept-model';
import { CommonUtils } from '@app/helpers/common-utils';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ObjectUtils } from '@app/helpers/object-utils';

const { send, receive } = new UrgentInterventionFinancialNotificationInterceptor();

@InterceptModel({ send, receive })
export class UrgentInterventionFinancialNotification extends LicenseApprovalModel<UrgentInterventionFinancialNotificationService, UrgentInterventionFinancialNotification> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  service!: UrgentInterventionFinancialNotificationService;
  caseType: number = CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION;
  requestType!: number;
  interventionName: string = '';
  projectDescription: string = '';
  beneficiaryCountry!: number;
  beneficiaryRegion: string = '';
  executionCountry!: number;
  executionRegion: string = '';
  description: string = '';
  implementingAgencyList: ImplementingAgency[] = [];
  interventionRegionList: InterventionRegion[] = [];
  interventionFieldList: InterventionField[] = [];
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;
  implementingAgencyType!: number;
  implementingAgency!: string;
  subject!: string;
  accountNumber!: string;
  amount!: number;
  accountType!: number;

  urgentAnnouncementFullSerial!: string;
  oldLicenseId!: string;
  fullSerial!: string;
  oldLicenseFullSerial!: string;

  searchFields: ISearchFieldsMap<UrgentInterventionFinancialNotification> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'requestTypeInfo', 'ouInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };
  constructor() {
    super();
    this.setService();
    this.finalizeSearchFields();
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  setService() {
    this.service = FactoryService.getService('UrgentInterventionFinancialNotificationService');
  }
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      urgentAnnouncementFullSerial: { langKey: 'intervention_name', value: this.urgentAnnouncementFullSerial },
    };
  }
  buildForm(control: boolean = false) {
    const values = ObjectUtils.getControlValues<UrgentInterventionFinancialNotification>(this.getBasicInfoValuesWithLabels())

    return {
      requestType: control ? [values.requestType, [CustomValidators.required]] : values.requestType,
      urgentAnnouncementFullSerial: control ? [values.urgentAnnouncementFullSerial, [CustomValidators.required, CustomValidators.maxLength(250)]] : values.urgentAnnouncementFullSerial,
    };
  }

  getTransferDataValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      implementingAgencyType: { langKey: 'implementation_agency_type', value: this.implementingAgencyType },
      accountType: { langKey: 'account_type', value: this.accountType },
      implementingAgency: { langKey: 'implementation_agency', value: this.implementingAgency },
      accountNumber: { langKey: 'account_number', value: this.accountNumber },
      amount: { langKey: 'amount', value: this.amount },
    };
  }
  buildTransferDataForm(control: boolean = false) {
    const values = ObjectUtils.getControlValues<UrgentInterventionFinancialNotification>(this.getTransferDataValuesWithLabels())

    return {
      implementingAgencyType: control ? [values.implementingAgencyType, [CustomValidators.required]] : values.implementingAgencyType,
      implementingAgency: control ? [values.implementingAgency, [CustomValidators.required]] : values.implementingAgency,
      accountType: control ? [values.accountType] : values.accountType,
      accountNumber: control ? [values.accountNumber, [CustomValidators.required]] : values.accountNumber,
      amount: control ? [values.amount, [CustomValidators.required]] : values.amount,
    };
  }
  getAdminResultByProperty(property: keyof UrgentInterventionFinancialNotification): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'beneficiaryCountry':
        adminResultValue = this.beneficiaryCountryInfo;
        break;
      case 'executionCountry':
        adminResultValue = this.executionCountryInfo;
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
}
