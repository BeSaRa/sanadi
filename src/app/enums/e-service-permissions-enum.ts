export enum EServicePermissionsEnum {
  /**
   * @description Don't use for permissions. It is just a prefix for all search service permissions
   */
  SEARCH_SERVICE_PREFIX = 'SEARCH_SERVICE_', // it is used as initial when setting permissions for user
  TEAM_INBOX = 'TEAM_INBOX', // it is not related to case type

  // e-service permissions permission name should be same name as CaseType enum
  // all search service permissions should have same prefix as value of SEARCH_SERVICE_PREFIX
  INQUIRY = 'INQUIRY',
  SEARCH_SERVICE_INQUIRY = 'SEARCH_SERVICE_INQUIRY',
  CONSULTATION = 'CONSULTATION',
  SEARCH_SERVICE_CONSULTATION = 'SEARCH_SERVICE_CONSULTATION',
  INTERNATIONAL_COOPERATION = 'INTERNATIONAL_COOPERATION',
  SEARCH_SERVICE_INTERNATIONAL_COOPERATION = 'SEARCH_SERVICE_INTERNATIONAL_COOPERATION',
  INTERNAL_PROJECT_LICENSE = 'INTERNAL_PROJECT_LICENSE',
  SEARCH_SERVICE_INTERNAL_PROJECT_LICENSE = 'SEARCH_SERVICE_INTERNAL_PROJECT_LICENSE',
  EXTERNAL_PROJECT_MODELS = 'EXTERNAL_PROJECT_MODELS',
  SEARCH_SERVICE_EXTERNAL_PROJECT_MODELS = 'SEARCH_SERVICE_EXTERNAL_PROJECT_MODELS',
  INITIAL_EXTERNAL_OFFICE_APPROVAL = 'INITIAL_EXTERNAL_OFFICE_APPROVAL',
  SEARCH_SERVICE_INITIAL_EXTERNAL_OFFICE_APPROVAL = 'SEARCH_SERVICE_INITIAL_EXTERNAL_OFFICE_APPROVAL',
  PARTNER_APPROVAL = 'PARTNER_APPROVAL',
  SEARCH_SERVICE_PARTNER_APPROVAL = 'SEARCH_SERVICE_PARTNER_APPROVAL',
  FINAL_EXTERNAL_OFFICE_APPROVAL = 'FINAL_EXTERNAL_OFFICE_APPROVAL',
  SEARCH_SERVICE_FINAL_EXTERNAL_OFFICE_APPROVAL = 'SEARCH_SERVICE_FINAL_EXTERNAL_OFFICE_APPROVAL',
  URGENT_INTERVENTION_LICENSING = 'URGENT_INTERVENTION_LICENSING',
  URGENT_INTERVENTION_ANNOUNCEMENT = 'URGENT_INTERVENTION_ANNOUNCEMENT',
  COLLECTION_APPROVAL = 'COLLECTION_APPROVAL',
  COLLECTOR_LICENSING = 'COLLECTOR_LICENSING',
  FUNDRAISING_LICENSING = 'FUNDRAISING_LICENSING',
  INTERNAL_BANK_ACCOUNT_APPROVAL = 'INTERNAL_BANK_ACCOUNT_APPROVAL',
  SEARCH_SERVICE_INTERNAL_BANK_ACCOUNT_APPROVAL = 'SEARCH_SERVICE_INTERNAL_BANK_ACCOUNT_APPROVAL',
  CUSTOMS_EXEMPTION_REMITTANCE = 'CUSTOMS_EXEMPTION_REMITTANCE',
  E_SERVICES_SEARCH = 'E_SERVICES_SEARCH',
  EXTERNAL_ORG_AFFILIATION_REQUEST = 'EXTERNAL_ORG_AFFILIATION_REQUEST',
  EMPLOYMENT = 'EMPLOYMENT',
  SEARCH_SERVICE_EMPLOYMENT = 'SEARCH_SERVICE_EMPLOYMENT',
  URGENT_JOINT_RELIEF_CAMPAIGN = 'URGENT_JOINT_RELIEF_CAMPAIGN',
  SEARCH_SERVICE_URGENT_JOINT_RELIEF_CAMPAIGN = 'SEARCH_SERVICE_URGENT_JOINT_RELIEF_CAMPAIGN',
  URGENT_INTERVENTION_CLOSURE = 'URGENT_INTERVENTION_CLOSURE',
  URGENT_INTERVENTION_FINANCIAL_NOTIFICATION = 'URGENT_INTERVENTION_FINANCIAL_NOTIFICATION',
  URGENT_INTERVENTION_LICENSE_FOLLOWUP = 'URGENT_INTERVENTION_LICENSE_FOLLOWUP',
  FOREIGN_COUNTRIES_PROJECTS = 'FOREIGN_COUNTRIES_PROJECTS',
  SEARCH_SERVICE_FOREIGN_COUNTRIES_PROJECTS = 'SEARCH_SERVICE_FOREIGN_COUNTRIES_PROJECTS',
  TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD = 'TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD',
  SEARCH_SERVICE_TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD = 'SEARCH_SERVICE_TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD',
  COORDINATION_WITH_ORGANIZATION_REQUEST='COORDINATION_WITH_ORGANIZATION_REQUEST',
  GENERAL_ASSOCIATION_MEETING_ATTENDANCE = 'GENERAL_ASSOCIATION_MEETING_ATTENDANCE',
  SEARCH_SERVICE_GENERAL_ASSOCIATION_MEETING_ATTENDANCE = 'SEARCH_SERVICE_GENERAL_ASSOCIATION_MEETING_ATTENDANCE',
  CHARITY_ORGANIZATION_UPDATE = 'CHARITY_ORGANIZATION_UPDATE',
  SEARCH_SERVICE_CHARITY_ORGANIZATION_UPDATE = 'SEARCH_SERVICE_CHARITY_ORGANIZATION_UPDATE',
  NPO_MANAGEMENT = 'NPO_MANAGEMENT',
  SEARCH_SERVICE_NPO_MANAGEMENT = 'SEARCH_SERVICE_NPO_MANAGEMENT',
  AWARENESS_ACTIVITY_SUGGESTION = 'AWARENESS_ACTIVITY_SUGGESTION',
  SEARCH_SERVICE_AWARENESS_ACTIVITY_SUGGESTION = 'SEARCH_SERVICE_AWARENESS_ACTIVITY_SUGGESTION',
  GENERAL_PROCESS_NOTIFICATION = 'GENERAL_PROCESS_NOTIFICATION',
  SEARCH_SERVICE_GENERAL_PROCESS_NOTIFICATION = 'SEARCH_SERVICE_GENERAL_PROCESS_NOTIFICATION',
  PROJECT_FUNDRAISING = 'PROJECT_FUNDRAISING',
  SEARCH_SERVICE_PROJECT_FUNDRAISING = 'SEARCH_SERVICE_PROJECT_FUNDRAISING',
  ORGANIZATION_ENTITIES_SUPPORT= 'ORGANIZATION_ENTITIES_SUPPORT',
  PROJECT_IMPLEMENTATION = 'PROJECT_IMPLEMENTATION',
  SEARCH_SERVICE_PROJECT_IMPLEMENTATION = 'SEARCH_SERVICE_PROJECT_IMPLEMENTATION',
  FINANCIAL_TRANSFERS_LICENSING ='FINANCIAL_TRANSFERS_LICENSING'
}
