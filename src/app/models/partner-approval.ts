import {GoalList} from './goal-list';
import {CommercialActivity} from './commercial-activity';
import {RequestClassifications} from '@enums/request-classifications.enum';
import {AdminResult} from './admin-result';
import {BankAccount} from './bank-account';
import {ExecutiveManagement} from './executive-management';
import {TargetGroup} from './target-group';
import {Goal} from './goal';
import {ManagementCouncil} from './management-council';
import {ContactOfficer} from './contact-officer';
import {ApprovalReason} from './approval-reason';
import {PartnerApprovalService} from '@services/partner-approval.service';
import {FactoryService} from '@services/factory.service';
import {CustomValidators} from '../validators/custom-validators';
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {DateUtils} from '@app/helpers/date-utils';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {InterceptModel} from '@decorators/intercept-model';
import {PartnerApprovalInterceptor} from '@app/model-interceptors/partner-approval-interceptor';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {MapService} from '@app/services/map.service';
import {WorkArea} from './work-area';
import {ObjectUtils} from '@helpers/object-utils';
import {CommonUtils} from '@helpers/common-utils';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';

const {send, receive} = new PartnerApprovalInterceptor();

@InterceptModel({send, receive})
export class PartnerApproval extends LicenseApprovalModel<PartnerApprovalService, PartnerApproval> implements IAuditModelProperties<PartnerApproval> {
  caseType: number = CaseTypes.PARTNER_APPROVAL;
  organizationId!: number;
  arName!: string;
  chiefDecision!: number;
  chiefJustification!: string;
  region!: string;
  country!: number;
  city!: string;
  address!: string;
  countryInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
  email!: string;
  enName!: string;
  establishmentDate!: string;
  fax!: string;
  headQuarterType!: number;
  headQuarterTypeInfo!: AdminResult;
  latitude!: string;
  longitude!: string;
  managerDecision!: number;
  managerJustification!: string;
  phone!: string;
  postalCode!: string;
  requestClassification!: number;
  requestClassificationInfo!: AdminResult;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  firstSocialMedia!: string;
  secondSocialMedia!: string;
  thirdSocialMedia!: string;
  specialistDecision!: number;
  specialistJustification!: string;
  state!: number;
  subject!: string;
  website!: string;
  goals!: string[];
  displayGoals!: | Goal[];
  bankAccountList!: BankAccount[];
  approvalReasonList!: ApprovalReason[];
  contactOfficerList!: ContactOfficer[];
  executiveManagementList!: ExecutiveManagement[];
  managementCouncilList!: ManagementCouncil[];
  workAreaObjectList: WorkArea[] = [];
  goalsList!: GoalList[];
  targetGroupList!: TargetGroup[];
  commercialActivitiesList!: CommercialActivity[];
  description!: string;
  commercialLicenseNo!: string;
  commercialLicenseEndDate!: string;

  // extra properties
  establishmentDateTimestamp!: number | null;
  commercialLicenseEndDateTimestamp!: number | null;
  service: PartnerApprovalService;
  mapService: MapService;
  defaultLatLng: google.maps.LatLngLiteral = {
    lat: 25.3266204,
    lng: 51.5310087,
  };

  searchFields: ISearchFieldsMap<PartnerApproval> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields([
      'requestTypeInfo',
      'creatorInfo',
      'caseStatusInfo',
      'countryInfo',
      'requestClassificationInfo',
      'ouInfo',
    ]),
    ...normalSearchFields(['subject', 'fullSerial']),
  };
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  constructor() {
    super();
    this.service = FactoryService.getService('PartnerApprovalService');
    this.mapService = FactoryService.getService('MapService');

    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
      oldLicenseFullSerial: {langKey: 'license_number', value: this.oldLicenseFullSerial},
      oldLicenseId: {langKey: {} as keyof ILanguageKeys, value: this.oldLicenseId,skipAuditComparison:true},
      oldLicenseSerial: {langKey: {} as keyof ILanguageKeys, value: this.oldLicenseSerial,skipAuditComparison:true},
      requestClassification: {langKey: 'request_classification', value: this.requestClassification},
      arName: {langKey: 'arabic_name', value: this.arName},
      enName: {langKey: 'english_name', value: this.enName},
      country: {langKey: 'country', value: this.country},
      address: {langKey: 'state_province', value: this.address},
      city: {langKey: 'city_village', value: this.city},
      headQuarterType: {langKey: 'headquarter_type', value: this.headQuarterType},
      region: {langKey: 'neighborhood_street_building', value: this.region},
      establishmentDate: {
        langKey: 'establishment_date',
        value: this.establishmentDate,
        comparisonValue: this.establishmentDateTimestamp
      },
      latitude: {langKey: 'latitude', value: this.latitude},
      longitude: {langKey: 'longitude', value: this.longitude},
      phone: {langKey: 'lbl_phone', value: this.phone},
      fax: {langKey: 'fax_number', value: this.fax},
      website: {langKey: 'website', value: this.website},
      email: {langKey: 'lbl_email', value: this.email},
      postalCode: {langKey: 'lbl_po_box_num', value: this.postalCode},
      firstSocialMedia: {langKey: 'social_media_1', value: this.firstSocialMedia},
      secondSocialMedia: {langKey: 'social_media_2', value: this.secondSocialMedia},
      thirdSocialMedia: {langKey: 'social_media_3', value: this.thirdSocialMedia},
      description: {langKey: 'special_explanations', value: this.description},
    };
  }

  getBasicFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<PartnerApproval>(this.getBasicInfoValuesWithLabels());
    return {
      oldLicenseFullSerial: control ? [values.oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : values.oldLicenseFullSerial,
      oldLicenseId: control ? [values.oldLicenseId] : values.oldLicenseId,
      oldLicenseSerial: control ? [values.oldLicenseSerial] : values.oldLicenseSerial,
      requestType: control ? [values.requestType, CustomValidators.required] : values.requestType,
      requestClassification: control ? [values.requestClassification, CustomValidators.required] : values.requestClassification,
      arName: control ? [values.arName, [
        CustomValidators.required,
        CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(
          CustomValidators.defaultLengths.ARABIC_NAME_MAX
        ),
        CustomValidators.minLength(
          CustomValidators.defaultLengths.MIN_LENGTH
        ),
      ],
      ] : values.arName,
      enName: control ? [values.enName, [
        CustomValidators.required,
        CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(
          CustomValidators.defaultLengths.ENGLISH_NAME_MAX
        ),
        CustomValidators.minLength(
          CustomValidators.defaultLengths.MIN_LENGTH
        ),
      ],
      ] : values.enName,
      country: control ? [values.country, CustomValidators.required] : values.country,
      city: control ? [values.city, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.city,
      address: control ? [values.address, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.address,
      region: control ? [values.region, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.region,
      headQuarterType: control ? [values.headQuarterType, CustomValidators.required] : values.headQuarterType,
      latitude: control ? [values.latitude, [
        CustomValidators.required,
        CustomValidators.pattern('NUM_HYPHEN_COMMA'),
      ],
      ] : values.latitude,
      longitude: control ? [values.longitude, [
        CustomValidators.required,
        CustomValidators.pattern('NUM_HYPHEN_COMMA'),
      ],
      ] : values.longitude,
      establishmentDate: control ? [values.establishmentDate, [CustomValidators.required, CustomValidators.maxDate(new Date())],] : DateUtils.changeDateToDatepicker(values.establishmentDate),
      phone: control ? [values.phone, [CustomValidators.required].concat(
        CustomValidators.commonValidations.phone
      ),] : values.phone,
      fax: control ? [values.fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax),] : values.fax,
      website: control ? [values.website, [
        CustomValidators.required,
        CustomValidators.pattern('WEBSITE'),
      ],
      ] : values.website,
      email: control ? [values.email, [
        CustomValidators.required,
        CustomValidators.pattern('EMAIL'),
        CustomValidators.maxLength(100),
      ],
      ] : values.email,
      postalCode: control ? [values.postalCode, [CustomValidators.required, CustomValidators.maxLength(100)],] : values.postalCode,
      firstSocialMedia: control ? [values.firstSocialMedia, [CustomValidators.required, CustomValidators.maxLength(100)],] : values.firstSocialMedia,
      secondSocialMedia: control ? [values.secondSocialMedia, CustomValidators.maxLength(100)] : values.secondSocialMedia,
      thirdSocialMedia: control ? [values.thirdSocialMedia, CustomValidators.maxLength(100)] : values.thirdSocialMedia,
      description: control ? [values.description, [
        CustomValidators.required,
        CustomValidators.maxLength(
          CustomValidators.defaultLengths.EXPLANATIONS
        ),
      ],
      ] : values.description,
    };
  }

  getCommercialLicenseValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      commercialLicenseNo: {langKey: 'commercial_License_No', value: this.commercialLicenseNo},
      commercialLicenseEndDate: {langKey: 'license_end_date', value: this.commercialLicenseEndDate, comparisonValue: this.commercialLicenseEndDateTimestamp},
    };
  }

  buildCommercialLicenseData(): any {
    const values = ObjectUtils.getControlValues<PartnerApproval>(this.getCommercialLicenseValuesWithLabels());
    return {
      commercialLicenseNo: values.commercialLicenseNo,
      commercialLicenseEndDate: DateUtils.changeDateToDatepicker(
        values.commercialLicenseEndDate
      ),
    };
  }

  isWithCommercialTrade(requestClassification?: number): boolean {
    return (
      requestClassification ===
      RequestClassifications.Private_Sector_Profit_Outside_Qatar ||
      requestClassification ===
      RequestClassifications.Private_Sector_None_Profit_Qatar ||
      requestClassification ===
      RequestClassifications.Private_Sector_None_Profit_Outside_Qatar
    );
  }

  hasMarker(): boolean {
    return !!this.longitude && !!this.latitude;
  }

  getLngLat(): google.maps.LatLngLiteral {
    return {
      lat: Number(this.latitude),
      lng: Number(this.longitude),
    };
  }

  openMap(viewOnly: boolean = false): DialogRef {
    return this.mapService.openMap({
      viewOnly,
      zoom: 18,
      center: this.hasMarker() ? this.getLngLat() : this.defaultLatLng,
      marker: this.hasMarker() ? this.getLngLat() : undefined,
    });
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof PartnerApproval): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'country':
        adminResultValue = this.countryInfo;
        break;
      case 'headQuarterType':
        adminResultValue = this.headQuarterTypeInfo;
        break;
      case 'establishmentDate':
        const dateValue = DateUtils.getDateStringFromDate(this.establishmentDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: dateValue, enName: dateValue});
        break;
      case 'commercialLicenseEndDate':
        const commercialLicenseEndDate = DateUtils.getDateStringFromDate(this.commercialLicenseEndDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: commercialLicenseEndDate, enName: commercialLicenseEndDate});
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }
}
