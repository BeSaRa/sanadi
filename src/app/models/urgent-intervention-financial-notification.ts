import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from '@app/models/admin-result';
import { InterventionField } from './intervention-field';
import { InterventionRegion } from './intervention-region';
import { ImplementingAgency } from './implementing-agency';
import { FactoryService } from './../services/factory.service';
import { UrgentInterventionFinancialNotificationService } from '../services/urgent-intervention-financial-notification.service';
import { LicenseApprovalModel } from '@app/models/license-approval-model';
import { CaseTypes } from '../enums/case-types.enum';

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
  licenseClassName!: string;
  implementingAgencyType!: number;
  implementingAgency!: string;
  accountNumber!: number;
  amount!: number;
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;

  fullSerial!: string;
  oldLicenseFullSerial!: string;
  constructor() {
    super();
    this.service = FactoryService.getService('UrgentInterventionFinancialNotificationService');
  }

  buildForm(control: boolean = false) {
    const {
      requestType,
      oldLicenseFullSerial,
    } = this;
    return {
      requestType: control ? [requestType, [CustomValidators.required]] : requestType,
      oldLicenseFullSerial: control ? [oldLicenseFullSerial, [CustomValidators.required]] : oldLicenseFullSerial,
    }
  }
}
