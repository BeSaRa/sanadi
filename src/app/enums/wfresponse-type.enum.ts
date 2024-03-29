export enum WFResponseType {
  VALIDATE_REJECT = 'validateReject',
  VALIDATE_APPROVE = 'validateApprove',
  ORGANIZATION_REJECT = 'orgReject',
  ORGANIZATION_APPROVE = 'orgApprove',
  INITIAL_APPROVE = 'initialApprove',
  CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewCustomsExemptionRemittance',
  TO_USER = 'toUser',
  APPROVE = 'approve',
  REJECT = 'reject',
  CLOSE = 'close',
  RETURN = 'return',
  RETURN_TO_ORG = 'returnToOrg',
  FINAL_REJECT = 'finalReject',
  COMPLETE = 'complete',
  TO_COMPETENT_DEPARTMENT = 'toCompetentDept',
  TO_MANAGER = 'toManager',
  POSTPONE = 'postpone',
  FINAL_APPROVE = 'finalApprove',
  ASK_FOR_CONSULTATION = 'launch:',
  INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewInternalProjectlicensing',
  INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewInitialExternalOfficeApproval',
  INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewInternalProjectlicensing',
  COLLECTION_APPROVAL_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewCollectionlicensing',
  COLLECTOR_LICENSING_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewCollectorlicensing',
  URGENT_INTERVENTION_LICENSE_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewUrgentInterventionLicensing',
  URGENT_INTERVENTION_LICENSE_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewUrgentInterventionLicensing',
  URGENT_INTERVENTION_CLOSURE_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewUrgentInterventionClosureApproval',
  URGENT_INTERVENTION_FOLLOWUP_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewFollowUp',
  FUNDRAISING_LICENSE_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewFundraisingChannelLicensing',
  GENERAL_NOTIFICATION_SEND_TO_SINGLE_DEPARTMENTS = 'askSingle:ReviewGeneralNotification',
  FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewFundraisingChannelLicensing',
  ORGANIZATION_ENTITIES_SUPPORT_TO_MULTI_DEPARTMENTS = 'ask:ReviewOrganizationsEntitiesSupport',
  PROJECT_IMPLEMENTATION_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewExternalProjectImplementationLicensing',
  FINANCIAL_TRANSFER_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewFinancialTransfersLicensing',

  INTERNAL_PROJECT_SEND_TO_EXPERT = 'ask:InternalProjectSpecialistReview', // not used anymore but still reference in multi-send popup
  TO_DEVELOPMENT_EXPERT = 'toDevExpert',
  TO_CONSTRUCTION_EXPERT = 'toConExpert',
  FINAL_NOTIFICATION = 'finalNotification',
  INTERNAL_BANK_ACCOUNT_APPROVAL_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewInternalBankAccountApproval',
  RETURN_TO_SPECIFIC_ORGANIZATION = 'returnSpecificOrg',
  TO_GENERAL_MEETING_MEMBERS = 'toMember',
  REVIEW_NPO_MANAGEMENT = 'ask:ReviewNPOManagement',
  TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewTransferringIndividualFundsAbroad',
  PROJECT_FUNDRAISING_SEND_TO_DEPARTMENTS = 'askSingle:ReviewProjectFundraising',
  AWARENESS_ACTIVITY_SUGGESTION_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewAwarenessActivitySuggestion',
  CHARITY_ORGANIZATION_UPDATE_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewCharityOrganizationRequest',
  ORGANIZATION_FINAL_APPROVE = 'orgFinalApprove',
  ORGANIZATION_FINAL_REJECT = 'orgFinalReject',
  FOREIGN_COUNTRIES_PROJECTS_LICENSING_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewForeignCountriesProjectsLicensing',
  FINAL_EXTERNAL_OFFICE_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewFinalExternalOfficeApproval',
  PARTNER_APPROVAL_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewPartnerApprovalRequest',
  SEND_TO_GM = 'sendToGM',
  TO_CHIEF = 'toChief',
  KNEW = 'knew',
  SEEN = 'seen',
  TO_GM = 'toGM',
  PROJECT_COMPLETION_SEND_TO_SINGLE_DEPARTMENT = "askSingle:ReviewProjectCompletionRequest"
}
