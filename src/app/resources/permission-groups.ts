import {PermissionsEnum} from '@app/enums/permissions-enum';
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {PermissionGroupsMapType} from '@app/types/types';
import {Constants} from '@helpers/constants';

const sanadiPermissionsGroup: PermissionsEnum[] = [
  PermissionsEnum.SANADI_UNDER_PROCESSING_REQUESTS,
  PermissionsEnum.SANADI_SEARCH_BENEFICIARY,
  PermissionsEnum.SANADI_INQUIRY_LOGS,
  PermissionsEnum.SANADI_ADD_REQUEST,
  PermissionsEnum.SANADI_PARTIAL_REQUEST,
  PermissionsEnum.SANADI_SEARCH_REQUEST,
  PermissionsEnum.SANADI_PARTIAL_REQUEST_REPORT
];
const restrictedPermissionsGroup: PermissionsEnum[] = [
  PermissionsEnum.WORLD_CHECK_SEARCH,
  PermissionsEnum.SCREENING_SEARCH_AUDIT
];
const adminPermissionsGroup: PermissionsEnum[] = [
  // PermissionsEnum.ADD_ORG_USER,
  // PermissionsEnum.EDIT_ORG_USER,
  PermissionsEnum.MANAGE_CUSTOM_ROLE,
  PermissionsEnum.MANAGE_AID_LOOKUP,
  PermissionsEnum.MANAGE_LOCALIZATION,
  PermissionsEnum.TRAINING_SURVEY_QUESTION,
  PermissionsEnum.TRAINING_SURVEY_TEMPLATE,
  PermissionsEnum.MANAGE_SERVICES_DATA,
  PermissionsEnum.MANAGE_TEAMS,
  PermissionsEnum.MANAGE_ATTACHMENT_TYPES,
  PermissionsEnum.MANAGE_COUNTRIES,
  PermissionsEnum.MANAGE_INTERNAL_USERS,
  PermissionsEnum.MANAGE_INTERNAL_DEPARTMENTS,
  PermissionsEnum.MANAGE_JOB_TITLES,
  PermissionsEnum.MANAGE_ADMIN_LOOKUP,
  PermissionsEnum.MANAGE_BANK,
  PermissionsEnum.MANAGE_DONORS,
  PermissionsEnum.MANAGE_FIELD_ASSESSMENT,
  PermissionsEnum.MANAGE_VACATIONS_DATE,
  PermissionsEnum.MANAGE_SDG,
  PermissionsEnum.MANAGE_CUSTOM_MENU_ITEM,
  PermissionsEnum.MANAGE_PROCESS_TEMPLATE,
  PermissionsEnum.MANAGE_SUB_TEAM,
  PermissionsEnum.MANAGE_PROFILE,
  PermissionsEnum.MANAGE_DYNAMIC_MODEL,
  PermissionsEnum.MANAGE_PROFILE,
  PermissionsEnum.MANAGE_EXTERNAL_USER_REQUEST_APPROVALS_DYNAMIC,
  PermissionsEnum.MANAGE_EXTERNAL_USER_DYNAMIC,
  PermissionsEnum.MANAGE_LICENSES_AND_PERMITS,
  PermissionsEnum.MANAGE_SYSTEM_PREFERENCES,
  PermissionsEnum.TRAINING_PROGRAM_CLASSIFICATION,
  PermissionsEnum.MANAGE_NPO_EMPLOYEE,
  PermissionsEnum.MANAGE_CHARITY_PROFILE_DATA,
  PermissionsEnum.MANAGE_NPO_PROFILE_DATA,
];

const externalUserPermissionsGroup: PermissionsEnum[] = [
  PermissionsEnum.ADD_ORG_USER,
  PermissionsEnum.EDIT_ORG_USER
];

const trainingProgramsPagePermissionsGroup: PermissionsEnum[] = [
  PermissionsEnum.TRAINING_ADD_TRAINEE,
  PermissionsEnum.TRAINING_CHARITY_MANAGEMENT,
  PermissionsEnum.TRAINING_CERTIFICATE_TEMPLATE,

  PermissionsEnum.TRAINING_BUNDLE,
  PermissionsEnum.TRAINING_CERTIFICATE_TRAINEE,
  PermissionsEnum.TRAINING_ADD_PUBLISH_PROGRAM,
  PermissionsEnum.TRAINING_MANAGE_TRAINEE,
  PermissionsEnum.TRAINING_PROGRAM_PARTNER,
  PermissionsEnum.TRAINING_PROGRAM_AUDIENCE,
];

const trainingProgramsMenuPermissionsGroup: PermissionsEnum[] = [
  PermissionsEnum.TRAINING_BUNDLE,
  PermissionsEnum.TRAINING_CERTIFICATE_TRAINEE,
  PermissionsEnum.TRAINING_ADD_PUBLISH_PROGRAM,
  PermissionsEnum.TRAINING_MANAGE_TRAINEE
];

const followupPermissionsGroup: PermissionsEnum[] = [
  PermissionsEnum.EXTERNAL_FOLLOWUP,
  PermissionsEnum.INTERNAL_FOLLOWUP
];

const consultationServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.CONSULTATION,
  EServicePermissionsEnum.SEARCH_SERVICE_CONSULTATION,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const inquiryServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.INQUIRY,
  EServicePermissionsEnum.SEARCH_SERVICE_INQUIRY,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const internationCooperationServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.INTERNATIONAL_COOPERATION,
  EServicePermissionsEnum.SEARCH_SERVICE_INTERNATIONAL_COOPERATION,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const projectImplementationServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.PROJECT_IMPLEMENTATION,
  EServicePermissionsEnum.SEARCH_SERVICE_PROJECT_IMPLEMENTATION,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const projectFundraisingServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.PROJECT_FUNDRAISING,
  EServicePermissionsEnum.SEARCH_SERVICE_PROJECT_FUNDRAISING,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const projectModelServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.EXTERNAL_PROJECT_MODELS,
  EServicePermissionsEnum.SEARCH_SERVICE_EXTERNAL_PROJECT_MODELS,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const internalProjectLicenseServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.INTERNAL_PROJECT_LICENSE,
  EServicePermissionsEnum.SEARCH_SERVICE_INTERNAL_PROJECT_LICENSE,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const generalProcessNotificationServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.GENERAL_PROCESS_NOTIFICATION,
  EServicePermissionsEnum.SEARCH_SERVICE_GENERAL_PROCESS_NOTIFICATION,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const awarenessActivitySuggestionServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.AWARENESS_ACTIVITY_SUGGESTION,
  EServicePermissionsEnum.SEARCH_SERVICE_AWARENESS_ACTIVITY_SUGGESTION,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const generalAssociationMeetingAttendanceServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.GENERAL_ASSOCIATION_MEETING_ATTENDANCE,
  EServicePermissionsEnum.SEARCH_SERVICE_GENERAL_ASSOCIATION_MEETING_ATTENDANCE,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const internalBankAccountApprovalServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.INTERNAL_BANK_ACCOUNT_APPROVAL,
  EServicePermissionsEnum.SEARCH_SERVICE_INTERNAL_BANK_ACCOUNT_APPROVAL,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const urgentJointReliefCampaignServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.URGENT_JOINT_RELIEF_CAMPAIGN,
  EServicePermissionsEnum.SEARCH_SERVICE_URGENT_JOINT_RELIEF_CAMPAIGN,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const transferringIndividualFundsAbroadServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD,
  EServicePermissionsEnum.SEARCH_SERVICE_TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const initialExternalOfficeApprovalServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.INITIAL_EXTERNAL_OFFICE_APPROVAL,
  EServicePermissionsEnum.SEARCH_SERVICE_INITIAL_EXTERNAL_OFFICE_APPROVAL,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const finalExternalOfficeApprovalServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.FINAL_EXTERNAL_OFFICE_APPROVAL,
  EServicePermissionsEnum.SEARCH_SERVICE_FINAL_EXTERNAL_OFFICE_APPROVAL,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const partnerApprovalServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.PARTNER_APPROVAL,
  EServicePermissionsEnum.SEARCH_SERVICE_PARTNER_APPROVAL,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const employmentServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.EMPLOYMENT,
  EServicePermissionsEnum.SEARCH_SERVICE_EMPLOYMENT,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const charityOrganizationUpdateServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.CHARITY_ORGANIZATION_UPDATE,
  EServicePermissionsEnum.SEARCH_SERVICE_CHARITY_ORGANIZATION_UPDATE,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const npoManagementServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.NPO_MANAGEMENT,
  EServicePermissionsEnum.SEARCH_SERVICE_NPO_MANAGEMENT,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const foreignCountriesProjectServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.FOREIGN_COUNTRIES_PROJECTS,
  EServicePermissionsEnum.SEARCH_SERVICE_FOREIGN_COUNTRIES_PROJECTS,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const externalOrgAffiliationServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.EXTERNAL_ORG_AFFILIATION_REQUEST,
  EServicePermissionsEnum.SEARCH_SERVICE_EXTERNAL_ORG_AFFILIATION_REQUEST,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const organizationEntitiesSupportServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.ORGANIZATION_ENTITIES_SUPPORT,
  EServicePermissionsEnum.SEARCH_SERVICE_ORGANIZATION_ENTITIES_SUPPORT,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const coordinationWithOrganizationRequestServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.COORDINATION_WITH_ORGANIZATION_REQUEST,
  EServicePermissionsEnum.SEARCH_SERVICE_COORDINATION_WITH_ORGANIZATION_REQUEST,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const customsExemptionRemittanceServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.CUSTOMS_EXEMPTION_REMITTANCE,
  EServicePermissionsEnum.SEARCH_SERVICE_CUSTOMS_EXEMPTION_REMITTANCE,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const financialTransfersLicensingServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.FINANCIAL_TRANSFERS_LICENSING,
  EServicePermissionsEnum.SEARCH_SERVICE_FINANCIAL_TRANSFERS_LICENSING,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const collectionApprovalServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.COLLECTION_APPROVAL,
  EServicePermissionsEnum.SEARCH_SERVICE_COLLECTION_APPROVAL,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const collectorApprovalServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.COLLECTOR_LICENSING,
  EServicePermissionsEnum.SEARCH_SERVICE_COLLECTOR_LICENSING,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const fundraisingLicensingServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.FUNDRAISING_LICENSING,
  EServicePermissionsEnum.SEARCH_SERVICE_FUNDRAISING_LICENSING,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const urgentInterventionLicensingServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.URGENT_INTERVENTION_LICENSING,
  EServicePermissionsEnum.SEARCH_SERVICE_URGENT_INTERVENTION_LICENSING,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const urgentInterventionAnnouncementServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.URGENT_INTERVENTION_ANNOUNCEMENT,
  EServicePermissionsEnum.SEARCH_SERVICE_URGENT_INTERVENTION_ANNOUNCEMENT,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const urgentInterventionClosureServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.URGENT_INTERVENTION_CLOSURE,
  EServicePermissionsEnum.SEARCH_SERVICE_URGENT_INTERVENTION_CLOSURE,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const urgentInterventionFinancialNotificationServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION,
  EServicePermissionsEnum.SEARCH_SERVICE_URGENT_INTERVENTION_FINANCIAL_NOTIFICATION,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const urgentInterventionLicenseFollowupServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.URGENT_INTERVENTION_LICENSE_FOLLOWUP,
  EServicePermissionsEnum.SEARCH_SERVICE_URGENT_INTERVENTION_LICENSE_FOLLOWUP,
  Constants.SERVICE_OUTPUT_PERMISSION
];

const projectCompletionServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.PROJECT_COMPLETION,
  EServicePermissionsEnum.SEARCH_SERVICE_PROJECT_COMPLETION,
  Constants.SERVICE_OUTPUT_PERMISSION
];
const financialAnalysisServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.FINANCIAL_ANALYSIS,
  EServicePermissionsEnum.SEARCH_SERVICE_FINANCIAL_ANALYSIS,
  Constants.SERVICE_OUTPUT_PERMISSION
];
const inspectionServicesPermissionGroup: (EServicePermissionsEnum | string)[] = [
  EServicePermissionsEnum.INSPECTION,
  EServicePermissionsEnum.PROPOSED_INSPECTION,
  EServicePermissionsEnum.ACTUAL_INSPECTION,
  EServicePermissionsEnum.SEARCH_SERVICE_INSPECTION,
  Constants.SERVICE_OUTPUT_PERMISSION
];
const generalServicesPermissionsGroup: EServicePermissionsEnum[] = [
  EServicePermissionsEnum.INQUIRY,
  EServicePermissionsEnum.CONSULTATION,
  EServicePermissionsEnum.INTERNATIONAL_COOPERATION,
  EServicePermissionsEnum.EMPLOYMENT,
  EServicePermissionsEnum.FOREIGN_COUNTRIES_PROJECTS,
  EServicePermissionsEnum.COORDINATION_WITH_ORGANIZATION_REQUEST,
  EServicePermissionsEnum.NPO_MANAGEMENT,
  EServicePermissionsEnum.CHARITY_ORGANIZATION_UPDATE,
  EServicePermissionsEnum.AWARENESS_ACTIVITY_SUGGESTION,
  EServicePermissionsEnum.EXTERNAL_ORG_AFFILIATION_REQUEST,
  EServicePermissionsEnum.GENERAL_PROCESS_NOTIFICATION,
  EServicePermissionsEnum.ORGANIZATION_ENTITIES_SUPPORT,
];

const officeServicesPermissionsGroup: EServicePermissionsEnum[] = [
  EServicePermissionsEnum.INITIAL_EXTERNAL_OFFICE_APPROVAL,
  EServicePermissionsEnum.PARTNER_APPROVAL,
  EServicePermissionsEnum.FINAL_EXTERNAL_OFFICE_APPROVAL
];

const projectServicesPermissionsGroup: EServicePermissionsEnum[] = [
  // EServicePermissionsEnum.INTERNAL_PROJECT_LICENSE,
  EServicePermissionsEnum.EXTERNAL_PROJECT_MODELS,
  EServicePermissionsEnum.INTERNAL_BANK_ACCOUNT_APPROVAL,
  EServicePermissionsEnum.URGENT_JOINT_RELIEF_CAMPAIGN,
  EServicePermissionsEnum.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD,
  EServicePermissionsEnum.GENERAL_ASSOCIATION_MEETING_ATTENDANCE,
  EServicePermissionsEnum.PROJECT_FUNDRAISING,
  EServicePermissionsEnum.PROJECT_IMPLEMENTATION,
];

const collectionServicesPermissionsGroup: EServicePermissionsEnum[] = [
  EServicePermissionsEnum.COLLECTOR_LICENSING,
  EServicePermissionsEnum.COLLECTION_APPROVAL,
  EServicePermissionsEnum.FUNDRAISING_LICENSING
];

const remittanceServicesPermissionsGroup: EServicePermissionsEnum[] = [
  EServicePermissionsEnum.CUSTOMS_EXEMPTION_REMITTANCE,
  EServicePermissionsEnum.FINANCIAL_TRANSFERS_LICENSING,
  EServicePermissionsEnum.FINANCIAL_ANALYSIS
];

const urgentInterventionServicesPermissionsGroup: EServicePermissionsEnum[] = [
  EServicePermissionsEnum.URGENT_INTERVENTION_LICENSING,
  EServicePermissionsEnum.URGENT_INTERVENTION_ANNOUNCEMENT,
  EServicePermissionsEnum.URGENT_INTERVENTION_CLOSURE,
  EServicePermissionsEnum.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION,
  EServicePermissionsEnum.URGENT_INTERVENTION_LICENSE_FOLLOWUP
];

const giveUsersPermissions: PermissionsEnum[] = [
  PermissionsEnum.NO_PERMISSION
];

const permissionGroups: PermissionGroupsMapType = {
  [PermissionGroupsEnum.CONSULTATION_SERVICES_PERMISSION_GROUP]: consultationServicesPermissionGroup,
  [PermissionGroupsEnum.INQUIRY_SERVICES_PERMISSION_GROUP]: inquiryServicesPermissionGroup,
  [PermissionGroupsEnum.INTERNATIONAL_COOP_SERVICES_PERMISSION_GROUP]: internationCooperationServicesPermissionGroup,
  [PermissionGroupsEnum.PROJECT_IMPLEMENTATION_SERVICES_PERMISSION_GROUP]: projectImplementationServicesPermissionGroup,
  [PermissionGroupsEnum.PROJECT_FUNDRAISING_SERVICES_PERMISSION_GROUP]: projectFundraisingServicesPermissionGroup,
  [PermissionGroupsEnum.PROJECT_MODEL_SERVICES_PERMISSION_GROUP]: projectModelServicesPermissionGroup,
  [PermissionGroupsEnum.INTERNAL_PROJECT_LICENSE_SERVICES_PERMISSION_GROUP]: internalProjectLicenseServicesPermissionGroup,
  [PermissionGroupsEnum.GENERAL_PROCESS_NOTIFICATION_SERVICES_PERMISSION_GROUP]: generalProcessNotificationServicesPermissionGroup,
  [PermissionGroupsEnum.AWARENESS_ACTIVITY_SUGGESTION_SERVICES_PERMISSION_GROUP]: awarenessActivitySuggestionServicesPermissionGroup,
  [PermissionGroupsEnum.GENERAL_ASSOCIATION_MEETING_ATTENDANCE_SERVICES_PERMISSION_GROUP]: generalAssociationMeetingAttendanceServicesPermissionGroup,
  [PermissionGroupsEnum.INTERNAL_BANK_ACCOUNT_APPROVAL_SERVICES_PERMISSION_GROUP]: internalBankAccountApprovalServicesPermissionGroup,
  [PermissionGroupsEnum.URGENT_JOINT_RELIEF_CAMPAIGN_SERVICES_PERMISSION_GROUP]: urgentJointReliefCampaignServicesPermissionGroup,
  [PermissionGroupsEnum.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD_SERVICES_PERMISSION_GROUP]: transferringIndividualFundsAbroadServicesPermissionGroup,
  [PermissionGroupsEnum.INITIAL_EXTERNAL_OFFICE_APPROVAL_SERVICES_PERMISSION_GROUP]: initialExternalOfficeApprovalServicesPermissionGroup,
  [PermissionGroupsEnum.FINAL_EXTERNAL_OFFICE_APPROVAL_SERVICES_PERMISSION_GROUP]: finalExternalOfficeApprovalServicesPermissionGroup,
  [PermissionGroupsEnum.PARTNER_APPROVAL_SERVICES_PERMISSION_GROUP]: partnerApprovalServicesPermissionGroup,
  [PermissionGroupsEnum.EMPLOYMENT_SERVICES_PERMISSION_GROUP]: employmentServicesPermissionGroup,
  [PermissionGroupsEnum.CHARITY_ORGANIZATION_UPDATE_SERVICES_PERMISSION_GROUP]: charityOrganizationUpdateServicesPermissionGroup,
  [PermissionGroupsEnum.NPO_MANAGEMENT_SERVICES_PERMISSION_GROUP]: npoManagementServicesPermissionGroup,
  [PermissionGroupsEnum.FOREIGN_COUNTRIES_PROJECTS_SERVICES_PERMISSION_GROUP]: foreignCountriesProjectServicesPermissionGroup,
  [PermissionGroupsEnum.EXTERNAL_ORG_AFFILIATION_REQUEST_SERVICES_PERMISSION_GROUP]: externalOrgAffiliationServicesPermissionGroup,
  [PermissionGroupsEnum.ORGANIZATION_ENTITIES_SUPPORT_SERVICES_PERMISSION_GROUP]: organizationEntitiesSupportServicesPermissionGroup,
  [PermissionGroupsEnum.COORDINATION_WITH_ORGANIZATION_REQUEST_SERVICES_PERMISSION_GROUP]: coordinationWithOrganizationRequestServicesPermissionGroup,
  [PermissionGroupsEnum.CUSTOMS_EXEMPTION_REMITTANCE_SERVICES_PERMISSION_GROUP]: customsExemptionRemittanceServicesPermissionGroup,
  [PermissionGroupsEnum.FINANCIAL_TRANSFERS_LICENSING_SERVICES_PERMISSION_GROUP]: financialTransfersLicensingServicesPermissionGroup,
  [PermissionGroupsEnum.COLLECTION_APPROVAL_SERVICES_PERMISSION_GROUP]: collectionApprovalServicesPermissionGroup,
  [PermissionGroupsEnum.COLLECTOR_LICENSING_SERVICES_PERMISSION_GROUP]: collectorApprovalServicesPermissionGroup,
  [PermissionGroupsEnum.FUNDRAISING_LICENSING_SERVICES_PERMISSION_GROUP]: fundraisingLicensingServicesPermissionGroup,
  [PermissionGroupsEnum.URGENT_INTERVENTION_LICENSING_SERVICES_PERMISSION_GROUP]: urgentInterventionLicensingServicesPermissionGroup,
  [PermissionGroupsEnum.URGENT_INTERVENTION_ANNOUNCEMENT_SERVICES_PERMISSION_GROUP]: urgentInterventionAnnouncementServicesPermissionGroup,
  [PermissionGroupsEnum.URGENT_INTERVENTION_CLOSURE_SERVICES_PERMISSION_GROUP]: urgentInterventionClosureServicesPermissionGroup,
  [PermissionGroupsEnum.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION_SERVICES_PERMISSION_GROUP]: urgentInterventionFinancialNotificationServicesPermissionGroup,
  [PermissionGroupsEnum.URGENT_INTERVENTION_LICENSE_FOLLOWUP_SERVICES_PERMISSION_GROUP]: urgentInterventionLicenseFollowupServicesPermissionGroup,
  [PermissionGroupsEnum.PROJECT_COMPLETION_SERVICES_PERMISSION_GROUP]: projectCompletionServicesPermissionGroup,
  [PermissionGroupsEnum.FINANCIAL_ANALYSIS_SERVICES_PERMISSION_GROUP]: financialAnalysisServicesPermissionGroup,
  [PermissionGroupsEnum.INSPECTION_SERVICE_PERMISSION_GROUP]: inspectionServicesPermissionGroup,


  [PermissionGroupsEnum.SANADI_PERMISSIONS_GROUP]: sanadiPermissionsGroup,
  [PermissionGroupsEnum.ADMIN_PERMISSIONS_GROUP]: adminPermissionsGroup,
  [PermissionGroupsEnum.MANAGE_EXTERNAL_USER_PERMISSIONS_GROUP]: externalUserPermissionsGroup,
  [PermissionGroupsEnum.GENERAL_SERVICES_PERMISSIONS_GROUP]: generalServicesPermissionsGroup,
  [PermissionGroupsEnum.OFFICE_SERVICES_PERMISSIONS_GROUP]: officeServicesPermissionsGroup,
  [PermissionGroupsEnum.PROJECTS_PERMISSION_GROUP]: projectServicesPermissionsGroup,
  [PermissionGroupsEnum.COLLECTION_SERVICES_GROUP]: collectionServicesPermissionsGroup,
  [PermissionGroupsEnum.REMITTANCE_PERMISSIONS_GROUP]: remittanceServicesPermissionsGroup,
  [PermissionGroupsEnum.URGENT_INTERVENTION_PERMISSIONS_GROUP]: urgentInterventionServicesPermissionsGroup,
  [PermissionGroupsEnum.TRAINING_PROGRAMS_PAGE_GROUP]: trainingProgramsPagePermissionsGroup,
  [PermissionGroupsEnum.TRAINING_PROGRAMS_MENU_ITEM_GROUP]: trainingProgramsMenuPermissionsGroup,
  [PermissionGroupsEnum.FOLLOWUP_PERMISSIONS_GROUP]: followupPermissionsGroup,
  [PermissionGroupsEnum.GIVE_USERS_PERMISSIONS]: giveUsersPermissions,
  [PermissionGroupsEnum.RESTRICTED_PERMISSIONS_GROUP]: restrictedPermissionsGroup,
};

export {permissionGroups as PermissionsGroupMap};
