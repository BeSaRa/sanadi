export enum WFResponseType {
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
  INTERNAL_PROJECT_SEND_TO_EXPERT = 'ask:InternalProjectSpecialistReview', // not used anymore but still reference in multi-send popup
  TO_DEVELOPMENT_EXPERT = 'toDevExpert',
  TO_CONSTRUCTION_EXPERT = 'toConExpert',
  TO_GM = 'toGM'
}
