import { AdminResult } from "@app/models/admin-result";
import { FileNetDocument } from "@app/models/file-net-document";
import { mixinCollectionItemBuildForm } from "@app/mixins/mixin-collection-item-build-form";
import { HasCollectionItemBuildForm } from "@app/interfaces/has-collection-item-build-form";
import { CollectionItem } from "@app/models/collection-item";

const _collectionItemBuildForm = mixinCollectionItemBuildForm(FileNetDocument)

export class CollectionLicense extends _collectionItemBuildForm implements HasCollectionItemBuildForm {
  caseStatusInfo!: AdminResult
  chiefDecision!: number
  chiefDecisionInfo!: AdminResult
  chiefJustification!: number
  conditionalLicenseIndicator!: false
  currentVersion!: number
  currentVersionDate!: string;
  customTerms!: string;
  followUpDate!: string;
  fullSerial!: string;
  inRenewalPeriod!: boolean
  licenseApprovedDate!: string;
  licenseDuration!: number
  licenseDurationType!: number
  licenseDurationTypeInfo!: AdminResult
  licenseStartDate!: string;
  licenseStatus!: number
  licenseStatusInfo!: AdminResult
  licenseType!: number
  managerDecision!: number
  managerDecisionInfo!: AdminResult
  managerJustification!: number
  orgInfo!: AdminResult
  organizationCode!: string
  organizationId!: number
  publicTerms!: string;
  requestCaseId!: string;
  requestClassification!: 4
  requestClassificationInfo!: AdminResult
  requestType!: 1
  requestTypeInfo!: AdminResult
  reviewerDepartmentDecision!: number
  reviewerDepartmentDecisionInfo!: AdminResult
  reviewerDepartmentJustification!: number
  secondSpecialistDecision!: 1
  secondSpecialistDecisionInfo!: AdminResult
  secondSpecialistJustification!: null
  serial!: number;
  specialistDecision!: number;
  specialistDecisionInfo!: AdminResult
  specialistJustification!: number
  subject!: string;

  convertToCollectionItem(): CollectionItem {
    return new CollectionItem().clone<CollectionItem>({
      oldLicenseId: this.id,
      oldLicenseFullSerial: this.fullSerial,
      oldLicenseSerial: this.serial,
      buildingNumber: this.buildingNumber,
      identificationNumber: this.identificationNumber,
      locationDetails: this.locationDetails,
      latitude: this.latitude,
      longitude: this.longitude,
      requestClassification: this.requestClassification,
      streetNumber: this.streetNumber,
      unitNumber: this.unitNumber,
      zoneNumber: this.zoneNumber,
      licenseStatusInfo: this.licenseStatusInfo,
      licenseDurationTypeInfo: this.licenseDurationTypeInfo,
      licenseStartDate: this.licenseStartDate || this.licenseApprovedDate,
      licenseEndDate: this.licenseEndDate,
    })
  }
}
