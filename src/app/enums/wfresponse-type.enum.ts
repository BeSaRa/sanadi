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
  FINAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewFinalExternalOfficeApproval',
  PARTNER_APPROVAL_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewPartnerApprovalRequest',
  INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewInternalProjectlicensing',
  COLLECTION_APPROVAL_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewCollectionlicensing',
  COLLECTOR_LICENSING_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewCollectorlicensing',
  URGENT_INTERVENTION_LICENSE_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewUrgentInterventionLicensing',
  URGENT_INTERVENTION_LICENSE_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewUrgentInterventionLicensing',
  URGENT_INTERVENTION_CLOSURE_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewUrgentInterventionClosureApproval',
  URGENT_INTERVENTION_FOLLOWUP_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewInterventionFollowUp',
  FUNDRAISING_LICENSE_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewFundraisingChannelLicensing',
  FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewFundraisingChannelLicensing',
  INTERNAL_PROJECT_SEND_TO_EXPERT = 'ask:InternalProjectSpecialistReview', // not used anymore but still reference in multi-send popup
  TO_DEVELOPMENT_EXPERT = 'toDevExpert',
  TO_CONSTRUCTION_EXPERT = 'toConExpert',
  TO_GM = 'toGM',
  FINAL_NOTIFICATION = 'finalNotification',
  INTERNAL_BANK_ACCOUNT_APPROVAL_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewInternalBankAccountApproval',
  RETURN_TO_SPECIFIC_ORGANIZATION = 'returnSpecificOrg',
  TRANSFER_FUND_REQUEST_TO_COMPLIANCE_AND_RISK_DEPARTMENT = 'askSingle:ReviewTransferringIndividualFundsAbroad',
  TO_GENERAL_MEETING_MEMBERS = 'toMember',
  REVIEW_NPO_MANAGEMENT = 'askSingle:ReviewNPOManagement',
  TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewTransferringIndividualFundsAbroad',
}
