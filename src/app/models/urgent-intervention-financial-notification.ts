import { ISearchFieldsMap } from './../types/types';
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

const { send, receive } = new UrgentInterventionFinancialNotificationInterceptor();

@InterceptModel({ send, receive })
export class UrgentInterventionFinancialNotification extends LicenseApprovalModel<UrgentInterventionFinancialNotificationService, UrgentInterventionFinancialNotification> {
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

  buildForm(control: boolean = false) {
    const {
      requestType,
      urgentAnnouncementFullSerial,
    } = this;
    return {
      requestType: control ? [requestType, [CustomValidators.required]] : requestType,
      urgentAnnouncementFullSerial: control ? [urgentAnnouncementFullSerial, [CustomValidators.required, CustomValidators.maxLength(250)]] : urgentAnnouncementFullSerial,
    };
  }

  buildTransferDataForm(control: boolean = false) {
    const {
      implementingAgencyType,
      accountType,
      implementingAgency,
      accountNumber,
      amount
    } = this;
    return {
      implementingAgencyType: control ? [implementingAgencyType, [CustomValidators.required]] : implementingAgencyType,
      implementingAgency: control ? [implementingAgency, [CustomValidators.required]] : implementingAgency,
      accountType: control ? [accountType] : accountType,
      accountNumber: control ? [accountNumber, [CustomValidators.required]] : accountNumber,
      amount: control ? [amount, [CustomValidators.required]] : amount,
    };
  }
}
