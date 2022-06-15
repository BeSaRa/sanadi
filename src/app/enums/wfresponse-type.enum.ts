export enum WFResponseType {
  VALIDATE_REJECT = 'validateReject',
  VALIDATE_APPROVE = 'validateApprove',
  ORGANIZATION_REJECT = 'orgReject',
  ORGANIZATION_APPROVE = 'orgApprove',
  INITIAL_APPROVE = 'initialApprove',
  SHIPPING_APPROVAL_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewCustomsExemptionRemittance',
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
  FUNDRAISING_LICENSE_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewFundraisingChannelLicensing',
  FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewFundraisingChannelLicensing',
  INTERNAL_PROJECT_SEND_TO_EXPERT = 'ask:InternalProjectSpecialistReview', // not used anymore but still reference in multi-send popup
  TO_DEVELOPMENT_EXPERT = 'toDevExpert',
  TO_CONSTRUCTION_EXPERT = 'toConExpert',
  TO_GM = 'toGM'
}
