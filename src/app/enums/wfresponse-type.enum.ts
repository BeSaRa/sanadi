export enum WFResponseType {
  TO_USER = 'toUser',
  APPROVE = 'approve',
  REJECT = 'reject',
  CLOSE = 'close',
  RETURN = 'return',
  COMPLETE = 'complete',
  TO_COMPETENT_DEPARTMENT = 'toCompetentDept',
  TO_MANAGER = 'toManager',
  POSTPONE = 'postpone',
  FINAL_APPROVE = 'finalApprove',
  ASK_FOR_CONSULTATION = 'launch:',
  INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS = 'ask:ReviewInternalProjectlicensing',
  INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT = 'askSingle:ReviewInternalProjectlicensing',
  INTERNAL_PROJECT_SEND_TO_EXPERT = 'ask:InternalProjectSpecialistReview', // not used anymore but still reference in multi-send popup
  TO_DEVELOPMENT_EXPERT = 'toDevExpert',
  TO_CONSTRUCTION_EXPERT = 'toConExpert',
  TO_GM = 'toGM'
}
