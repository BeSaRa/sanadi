import { IAppUrls } from '@contracts/i-app-urls';

export const urlsList = {
  // BASE_URL: '', // it will be overridden from CONFIGURATION
  FOLLOWUP_PERMISSION: '/admin/follow-up-permission',
  COMMON: '/common',
  CUSTOMS_EXEMPTION_REMITTANCE: '/customs-exemption-remittance',
  FUNDRAISING: '/fundraising-channel-licensing',
  NPO_EMPLOYEE: 'admin/npo-employee',
  BANK_ACCOUNT: 'admin/bank-account',
  BANK: 'admin/bank',
  INTERNAL_BANK_ACCOUNT_APPROVAL: 'internal-bank-approval',
  FOLLOWUP_COMMENT: 'admin/follow-up-comment',
  FOLLOWUP: 'admin/follow-up',
  COLLECTOR_APPROVAL: 'collector-licensing',
  MAP_API_URL: 'https://maps.googleapis.com/maps/api/js?libraries=places&key=',
  FOLLOWUP_CONFIGURATION: 'admin/follow-up-configuration',
  COLLECTION_APPROVAL: '/collection-licensing',
  ORG_UNIT_FIELD: 'admin/org-unit-field',
  CHECKLIST: 'admin/checklist',
  SERVICE_DATA_STEP: 'admin/service-steps',
  SURVEY: '/training/training-survey',
  SURVEY_SECTION: '/training/training-survey-quest-section',
  SURVEY_TEMPLATE: '/training/training-survey-template',
  TRAINING_PROGRAM_CERTIFICATE: '/training/training-certificate/certificate',
  SURVEY_QUESTION: '/training/training-survey-quest',
  CERTIFICATE_TEMPLATE: '/training/training-certificate/template',
  INTERNAL_USER_DEPARTMENT: '/admin/internal-user-department',
  TEAM_SECURITY: '/admin/team-sec-config',
  USER_SECURITY: '/admin/user-sec-config',
  EXTERNAL_USER_SECURITY: '/admin/org-user-service-permission',
  PROJECT_MODELING: '/project-modeling',
  TRAINING_PROGRAM: 'training/training-program',
  TRAINING_PROGRAM_BUNDLE: 'training/training-program/bundle',
  TRAINER: 'training/trainer',
  ADMIN_LOOKUP: 'admin/admin-lookup',
  DAC_OCHA: 'admin/work-field',
  SD_GOAL: 'admin/sdg',
  JOB_TITLE: 'admin/job-title',
  LANGUAGE: 'admin/localization',
  INITIAL_OFFICE_APPROVAL: '/initial-office-approval',
  ATTACHMENT_TYPES: 'admin/attachment-type',
  ATTACHMENT_TYPES_SERVICE_DATA: 'admin/attachment-type/service',
  ATTACHMENT_TYPES_CUSTOM_PROPERTIES: 'admin/attachment-type/custom-properties',
  COUNTRY: 'admin/country',
  AUTHENTICATE: 'auth/nas/login',
  INTERNAL_AUTHENTICATE: 'auth/internal/login',
  VALIDATE_TOKEN: '/auth/validate-token',
  LOGIN_INFO: 'auth/login/info',
  CUSTOM_ROLE: 'admin/org-user-custom-role',
  CUSTOM_ROLE_PERMISSIONS: 'custom-role-permissions',
  LOOKUPS: 'lookups',
  ORGANIZATION_UNIT: 'admin/ou',
  ORGANIZATION_UNIT_SERVICES: 'admin/ou-service',
  ORGANIZATION_BRANCH: 'admin/ou/branch',
  PERMISSIONS: 'admin/permission',
  AID_LOOKUPS: 'admin/aid-lookup',
  AID_LOOKUPS_CRITERIA: 'admin/aid-lookup/criteria',
  ORGANIZATION: 'admin/ou',
  ORG_USER: 'admin/user',
  ORG_USER_PERMISSION: 'admin/org-user-permission',
  CACHE_SERVICE: 'admin/config/refresh-cache',
  BENEFICIARY: 'aids/beneficiary',
  SUBVENTION_REQUEST: 'aids/subvention-request',
  SUBVENTION_REQUEST_PARTIAL: 'aids/subvention-request/partial-requests',
  SUBVENTION_REQUEST_PARTIAL_LOG: 'aids/subvention-request-log/partial-requests',
  SUBVENTION_REQUEST_AID: 'aids/subvention-request/sub-aids',
  SUBVENTION_LOG: 'aids/subvention-request-log',
  SUBVENTION_AID: '/aids/subvention-aid',
  SANADI_ATTACHMENT: '/aids/sanadi-attachment',
  EXT_YOUTUBE: 'https://www.youtube.com/channel/UCP53uXuaKvH4A6lCblvggIg',
  EXT_INSTAGRAM: 'https://www.instagram.com/racaqa/',
  EXT_FACEBOOK: 'https://web.facebook.com/RACAqa/',
  EXT_TWITTER: 'https://twitter.com/Racaqa',
  EXT_RACA: 'https://www.raca.gov.qa',
  E_INQUIRY: '/inquiry',
  E_CONSULTATION: '/consultation',
  E_INTERNATIONAL_COOPERATION: '/international-cooperation',
  E_PARTNER_APPROVAL: '/partner-approval',
  USER_INBOX: '/inbox/user',
  TEAMS_INBOX: '/inbox/team',
  CLAIM_BULK: '/inbox/task/claim/bulk',
  READ_BULK: '/inbox/task/read/bulk',
  RELEASE_BULK: '/inbox/task/return/bulk',
  TEAMS: '/admin/baw/team',
  CUSTOM_TERMS: '/admin/terms',
  INTERNAL_USER: '/admin/internal/user',
  INTERNAL_DEPARTMENT: 'admin/internal/department',
  SERVICE_DATA: 'admin/services',
  SERVICE_DATA_2: 'admin/services/2',
  SERVICE_DATA_10: 'admin/services/10',
  E_FINAL_EXTERNAL_OFFICE_APPROVAL: '/external-office-approval',
  INTERNAL_USER_PERMISSIONS: '/admin/internal-user-permission',
  INTERNAL_PROJECT_LICENSE: '/internal-project-licensing',
  URGENT_INTERVENTION_LICENSE: '/urgent-intervention-licensing',
  EMPLOYMENT: '/employment',
  DONOR: 'admin/donor',
  URGENT_JOINT_RELIEF_CAMPAIGN: '/urgent-joint-relief-campaign',
  URGENT_INTERVENTION_ANNOUNCEMENT: '/urgent-intervention-announcement',
  URGENT_INTERVENTION_CLOSURE: '/urgent-intervention-closure',
  EXTERNAL_PROJECT_IMPLEMENTATION: '/external-project-implementation',
  FIELD_ASSESSMENT: '/admin/field-assessment',
  EXTERNAL_ORG_AFFILIATION_REQUEST: '/external-org-affiliation',
  URGENT_INTERVENTION_FINANCIAL_NOTIFICATION: '/urgent-intervention-financial-notification',
  URGENT_INTERVENTION_LICENSE_FOLLOWUP: '/urgent-intervention-follow-up',
  URGENT_INTERVENTION_REPORT: '/admin/intervention-report',
  VACATION_DATE: '/admin/vacation',
  FOREIGN_COUNTRIES_PROJECTS: '/foreign-countries-projects',
  TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD: '/transferring-individual-funds-abroad',
  TRANSFERRING_ENTITY: '/admin/transferring-entity',
  CHARITY_ORGANIZATION_UPDATE: '/charity-organization-update',
  E_COORDINATION_WITH_ORGANIZATION_REQUEST: '/coordination-with-organizations-request',
  GENERAL_ASSOCIATION_MEETING_ATTENDANCE: '/general-association-meeting-attendance',
  CHARITY_ORGANIZATION: '/admin/charity-organization',
  CHARITY_REPORT: '/admin/charity-report',
  CHARITY_DECISION: '/admin/charity-decision',
  MEMBER_ROLES: '/admin/member-role',
  GOVERNANCE_DOCUMENT: '/admin/governance-document',
  REAL_BENEFECIARY: '/admin/real-beneficiary',
  NPO_MANAGEMENT: '/npo-management',
  NPO_DATA: '/admin/npo-data',
  PROFILE: '/admin/profile',
  PROFILE_SERVICE: '/admin/profile-service',
  AWARENESS_ACTIVITY_SUGGESTION: '/awareness-activity-suggestion',
  MENU_ITEM_LIST: '/admin/menu-item'
};
