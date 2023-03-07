import {
  GeneralProcessNotificationComponent
} from '@modules/general-services/pages/general-process-notification/general-process-notification.component';
import {
  AwarenessActivitySuggestionComponent
} from '@modules/general-services/pages/awareness-activity-suggestion/awareness-activity-suggestion.component';
import {
  ForeignCountriesProjectsComponent
} from '@app/modules/general-services/pages/foreign-countries-projects/foreign-countries-projects.component';
import {
  UrgentInterventionFinancialNotificationComponent
} from '@modules/urgent-intervention/pages/urgent-intervention-financial-notification/urgent-intervention-financial-notification.component';
import {EmploymentComponent} from '@modules/general-services/pages/employment/employment.component';
import {NpoManagementComponent} from '@modules/general-services/pages/npo-management/npo-management.component';
import {Injectable} from '@angular/core';
import {DynamicComponentService} from './dynamic-component.service';
import {TeamService} from './team.service';
import {CustomEmployeePermission} from '@app/helpers/custom-employee-permission';
/*import {
  InternationalCooperationComponent
} from '@app/modules/general-services/pages/international-cooperation/international-cooperation.component';*/
import {
  InternationalCooperationComponent
} from '@app/modules/services/international-cooperation/pages/international-cooperation/international-cooperation.component';
import {
  InitialExternalOfficeApprovalComponent
} from '@app/modules/office-services/pages/initial-external-office-approval/initial-external-office-approval.component';
import {
  FinalExternalOfficeApprovalComponent
} from '@app/modules/office-services/pages/final-external-office-approval/final-external-office-approval.component';
import {
  PartnerApprovalComponent
} from '@app/modules/office-services/pages/partner-approval/partner-approval.component';
import {
  InternalProjectLicenseComponent
} from '@app/modules/projects/pages/internal-project-license/internal-project-license.component';
import {ProjectModelComponent} from '@app/modules/projects/pages/project-model/project-model.component';
import {
  CollectionApprovalComponent
} from '@app/modules/collection/pages/collection-services-approval/collection-approval.component';
import {MapService} from '@app/services/map.service';
import {FundraisingComponent} from '@app/modules/collection/pages/fundraising/fundraising.component';
import {
  CollectorApprovalComponent
} from '@app/modules/collection/pages/collector-approval/collector-approval.component';
import {
  CustomsExemptionComponent
} from '@app/modules/remittances/pages/customs-exemption/customs-exemption.component';
import {
  InternalBankAccountApprovalComponent
} from '@app/modules/projects/pages/internal-bank-account-approval/internal-bank-account-approval.component';

import {
  UrgentJointReliefCampaignComponent
} from '@app/modules/projects/pages/urgent-joint-relief-campaign/urgent-joint-relief-campaign.component';
import {
  UrgentInterventionAnnouncementComponent
} from '@app/modules/urgent-intervention/pages/urgent-intervention-announcement/urgent-intervention-announcement.component';
import {
  UrgentInterventionClosureComponent
} from '@app/modules/urgent-intervention/pages/urgent-intervention-closure/urgent-intervention-closure.component';
import {
  ExternalOrgAffiliationComponent
} from '@modules/general-services/pages/external-org-affiliation/external-org-affiliation.component';
import {
  UrgentInterventionLicenseComponent
} from '@app/modules/urgent-intervention/pages/urgent-intervention-license/urgent-intervention-license.component';
import {
  TransferringIndividualFundsAbroadComponent
} from '@app/modules/projects/pages/transferring-individual-funds-abroad/transferring-individual-funds-abroad.component';
import {
  CoordinationWithOrganizationsRequestComponent
} from '@app/modules/general-services/pages/coordination-with-organizations-request/coordination-with-organizations-request.component';
import {
  UrgentInterventionLicenseFollowupComponent
} from '@app/modules/urgent-intervention/pages/urgent-intervention-license-followup/urgent-intervention-license-followup.component';
import {
  GeneralAssociationMeetingAttendanceComponent
} from '@app/modules/projects/pages/general-association-meeting-attendance/general-association-meeting-attendance.component';
import {
  CharityOrganizationUpdateComponent
} from '@app/modules/general-services/pages/charity-organization-update/charity-organization-update.component';
import {PermissionsEnum} from '@app/enums/permissions-enum';
// import {ConsultationComponent} from '@app/modules/general-services/pages/consultation/consultation.component';
import {ConsultationComponent} from '@app/modules/services/consultation/pages/consultation/consultation.component';
// import {InquiryComponent} from '@app/modules/general-services/pages/inquiry/inquiry.component';
import {InquiryComponent} from '@app/modules/services/inquiries-and-complaints/pages/inquiry/inquiry.component';
import {
  ProjectFundraisingComponent
} from "@app/modules/projects/pages/project-fundraising/project-fundraising.component";
import {
  OrganizationsEntitiesSupportComponent
} from '@app/modules/general-services/pages/organizations-entities-support/organizations-entities-support.component';
import {
  ProjectImplementationComponent
} from "@modules/projects/pages/project-implementation/project-implementation.component";
import { FinancialTransfersLicensingComponent } from '@app/modules/remittances/pages/financial-transfers-licensing/financial-transfers-licensing.component';

@Injectable({
  providedIn: 'root'
})
export class AutoRegisterService {

  constructor(private teamService: TeamService,
              private mapService: MapService) { // teamService is injected because it is used in info request
    this.ngOnInit();
    this.mapService.ping();
  }

  private ngOnInit(): void {
    new DynamicComponentService(() => {
      // any Dynamic Components will be register here.
      DynamicComponentService.registerComponent('InquiryComponent', InquiryComponent);
      DynamicComponentService.registerComponent('ConsultationComponent', ConsultationComponent);
      DynamicComponentService.registerComponent('InternationalCooperationComponent', InternationalCooperationComponent);
      DynamicComponentService.registerComponent('InitialExternalOfficeApprovalComponent', InitialExternalOfficeApprovalComponent);
      DynamicComponentService.registerComponent('FinalExternalOfficeApprovalComponent', FinalExternalOfficeApprovalComponent);
      DynamicComponentService.registerComponent('PartnerApprovalComponent', PartnerApprovalComponent);
      DynamicComponentService.registerComponent('InternalProjectLicenseComponent', InternalProjectLicenseComponent);
      DynamicComponentService.registerComponent('ProjectModelComponent', ProjectModelComponent);
      DynamicComponentService.registerComponent('CollectionApprovalComponent', CollectionApprovalComponent);
      DynamicComponentService.registerComponent('FundraisingComponent', FundraisingComponent);
      DynamicComponentService.registerComponent('CollectorApprovalComponent', CollectorApprovalComponent);
      DynamicComponentService.registerComponent('UrgentInterventionLicenseComponent', UrgentInterventionLicenseComponent);
      DynamicComponentService.registerComponent('CustomsExemptionComponent', CustomsExemptionComponent);
      DynamicComponentService.registerComponent('InternalBankAccountApprovalComponent', InternalBankAccountApprovalComponent);
      DynamicComponentService.registerComponent('EmploymentComponent', EmploymentComponent);
      DynamicComponentService.registerComponent('UrgentJointReliefCampaignComponent', UrgentJointReliefCampaignComponent);
      DynamicComponentService.registerComponent('UrgentInterventionAnnouncementComponent', UrgentInterventionAnnouncementComponent);
      DynamicComponentService.registerComponent('UrgentInterventionClosureComponent', UrgentInterventionClosureComponent);
      DynamicComponentService.registerComponent('UrgentInterventionLicenseFollowupComponent', UrgentInterventionLicenseFollowupComponent);
      DynamicComponentService.registerComponent('ExternalOrgAffiliationComponent', ExternalOrgAffiliationComponent);
      DynamicComponentService.registerComponent('UrgentInterventionFinancialNotificationComponent', UrgentInterventionFinancialNotificationComponent);
      DynamicComponentService.registerComponent('ForeignCountriesProjectsComponent', ForeignCountriesProjectsComponent);
      DynamicComponentService.registerComponent('TransferringIndividualFundsAbroadComponent', TransferringIndividualFundsAbroadComponent);
      DynamicComponentService.registerComponent('CoordinationWithOrganizationsRequestComponent', CoordinationWithOrganizationsRequestComponent);
      DynamicComponentService.registerComponent('GeneralAssociationMeetingAttendanceComponent', GeneralAssociationMeetingAttendanceComponent);
      DynamicComponentService.registerComponent('CharityOrganizationUpdateComponent', CharityOrganizationUpdateComponent);
      DynamicComponentService.registerComponent('NpoManagementComponent', NpoManagementComponent);
      DynamicComponentService.registerComponent('AwarenessActivitySuggestionComponent', AwarenessActivitySuggestionComponent);
      DynamicComponentService.registerComponent('GeneralProcessNotificationComponent', GeneralProcessNotificationComponent);
      DynamicComponentService.registerComponent('ProjectFundraisingComponent', ProjectFundraisingComponent);
      DynamicComponentService.registerComponent('OrganizationsEntitiesSupportComponent', OrganizationsEntitiesSupportComponent);
      DynamicComponentService.registerComponent('FinancialTransfersLicensingComponent', FinancialTransfersLicensingComponent);
      DynamicComponentService.registerComponent('ProjectImplementationComponent', ProjectImplementationComponent);
    });// just to make sure that service constructed and register all dynamic components


    // for making custom permissions form the menu based on the current employee
    (new CustomEmployeePermission)
      .registerCustomPermission('menu_reports', (employee, _item) => {
        return employee.isInternalUser();
      })
      .registerCustomPermission('menu_available_programs', (employee, _item) => {
        return employee.isExternalUser();
      })
      .registerCustomPermission('menu_internal_followup', (employee, _item) => {
        return employee.isInternalUser();
      })
      .registerCustomPermission('menu_external_followup', (employee, _item) => {
        return employee.isExternalUser() || (employee.isInternalUser() && employee.hasPermissionTo(PermissionsEnum.EXTERNAL_FOLLOWUP));
      })

  }

  ping(): void {
    console.log('auto register service started');
  }
}
