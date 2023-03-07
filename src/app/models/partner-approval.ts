import { GoalList } from './goal-list';
import { CommercialActivity } from './commercial-activity';
import { RequestClassifications } from './../enums/request-classifications.enum';
import { AdminResult } from './admin-result';
import { BankAccount } from './bank-account';
import { ExecutiveManagement } from './executive-management';
import { TargetGroup } from './target-group';
import { Goal } from './goal';
import { ManagementCouncil } from './management-council';
import { ContactOfficer } from './contact-officer';
import { ApprovalReason } from './approval-reason';
import { PartnerApprovalService } from '@services/partner-approval.service';
import { FactoryService } from '@services/factory.service';
import { CustomValidators } from '../validators/custom-validators';
import { LicenseApprovalModel } from '@app/models/license-approval-model';
import { DateUtils } from '@app/helpers/date-utils';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ISearchFieldsMap } from '@app/types/types';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { InterceptModel } from '@decorators/intercept-model';
import { PartnerApprovalInterceptor } from '@app/model-interceptors/partner-approval-interceptor';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { MapService } from '@app/services/map.service';
import { WorkArea } from './work-area';

const { send, receive } = new PartnerApprovalInterceptor();
@InterceptModel({ send, receive })
export class PartnerApproval extends LicenseApprovalModel<
PartnerApprovalService,
PartnerApproval
> {
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

  getBasicFields(control: boolean = false): any {
    const {
      requestType,
      requestClassification,
      arName,
      enName,
      country,
      city,
      address,
      region,
      headQuarterType,
      latitude,
      longitude,
      establishmentDate,
      phone,
      fax,
      website,
      email,
      postalCode,
      firstSocialMedia,
      secondSocialMedia,
      thirdSocialMedia,
      description,
      oldLicenseFullSerial,
      oldLicenseId,
      oldLicenseSerial,
    } = this;

    return {
      oldLicenseFullSerial: control
        ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]]
        : oldLicenseFullSerial,
      oldLicenseId: control ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: control ? [oldLicenseSerial] : oldLicenseSerial,
      requestType: control
        ? [requestType, CustomValidators.required]
        : requestType,
      requestClassification: control
        ? [requestClassification, CustomValidators.required]
        : requestClassification,
      arName: control
        ? [
          arName,
          [
            CustomValidators.required,
            CustomValidators.pattern('AR_ONLY'),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ARABIC_NAME_MAX
            ),
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
          ],
        ]
        : arName,
      enName: control
        ? [
          enName,
          [
            CustomValidators.required,
            CustomValidators.pattern('ENG_ONLY'),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
          ],
        ]
        : enName,
      country: control ? [country, CustomValidators.required] : country,
      city: control
        ? [city, [CustomValidators.required, CustomValidators.maxLength(50)]]
        : city,
      address: control
        ? [address, [CustomValidators.required, CustomValidators.maxLength(50)]]
        : address,
      region: control
        ? [region, [CustomValidators.required, CustomValidators.maxLength(50)]]
        : region,
      headQuarterType: control
        ? [headQuarterType, CustomValidators.required]
        : headQuarterType,
      latitude: control
        ? [
          latitude,
          [
            CustomValidators.required,
            CustomValidators.pattern('NUM_HYPHEN_COMMA'),
          ],
        ]
        : latitude,
      longitude: control
        ? [
          longitude,
          [
            CustomValidators.required,
            CustomValidators.pattern('NUM_HYPHEN_COMMA'),
          ],
        ]
        : longitude,
      establishmentDate: control
        ? [
          establishmentDate,
          [CustomValidators.required, CustomValidators.maxDate(new Date())],
        ]
        : DateUtils.changeDateToDatepicker(establishmentDate),
      phone: control
        ? [
          phone,
          [CustomValidators.required].concat(
            CustomValidators.commonValidations.phone
          ),
        ]
        : phone,
      fax: control
        ? [
          fax,
          [CustomValidators.required].concat(
            CustomValidators.commonValidations.fax
          ),
        ]
        : fax,
      website: control
        ? [
          website,
          [
            CustomValidators.required,
            CustomValidators.maxLength(300),
          ],
        ]
        : website,
      email: control
        ? [
          email,
          [
            CustomValidators.required,
            CustomValidators.pattern('EMAIL'),
            CustomValidators.maxLength(100),
          ],
        ]
        : email,
      postalCode: control
        ? [
          postalCode,
          [CustomValidators.required, CustomValidators.maxLength(100)],
        ]
        : postalCode,
      firstSocialMedia: control
        ? [
          firstSocialMedia,
          [CustomValidators.required, CustomValidators.maxLength(100)],
        ]
        : firstSocialMedia,
      secondSocialMedia: control
        ? [secondSocialMedia, CustomValidators.maxLength(100)]
        : secondSocialMedia,
      thirdSocialMedia: control
        ? [thirdSocialMedia, CustomValidators.maxLength(100)]
        : thirdSocialMedia,
      description: control
        ? [
          description,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.EXPLANATIONS
            ),
          ],
        ]
        : description,
    };
  }
  buildCommercialLicenseData(): any {
    const { commercialLicenseNo, commercialLicenseEndDate } = this;

    return {
      commercialLicenseNo: commercialLicenseNo,
      commercialLicenseEndDate: DateUtils.changeDateToDatepicker(
        commercialLicenseEndDate
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
}
