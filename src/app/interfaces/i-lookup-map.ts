import {Lookup} from '@models/lookup';

export interface ILookupMap {
  RiskLevel: Lookup[];
  LevelOfDueDiligence: Lookup[];
  AdminAuditOperation: Lookup[];
  AdminLookupType: Lookup[];
  AffiliationCategory: Lookup[];
  AffiliationRequestType: Lookup[];
  AidLookupStatus: Lookup[];
  AidType: Lookup[];
  AllRequestTypes: Lookup[];
  ApprovalDecision: Lookup[];
  ATTACHMENT_TYPE: Lookup[];
  BankCategory: Lookup[];
  BankOperationType: Lookup[];
  BankRequestType: Lookup[];
  BenAddressStatus: Lookup[];
  BenCategory: Lookup[];
  BenEducationLevel: Lookup[];
  BENEFICIARY_INCOME: Lookup[];
  BENEFICIARY_INCOME_PERODIC: Lookup[];
  BENEFICIARY_OBLIGATION: Lookup[];
  BenIdType: Lookup[];
  BenMaritialStatus: Lookup[];
  BenOccuptionStatus: Lookup[];
  BenRequestorRelationType: Lookup[];
  BenStatusType: Lookup[];
  BranchAdjective: Lookup[];
  BranchCategory: Lookup[];
  CharityDecisionType: Lookup[];
  CharityReportStatus: Lookup[];
  CharityReportType: Lookup[];
  CharityUpdateSection: Lookup[];
  CharityWorkArea: Lookup[];
  Cities: Lookup[];
  CollectionClassification: Lookup[];
  CollectionRequestType: Lookup[];
  CollectorRelation: Lookup[];
  CollectorType: Lookup[];
  CommentType: Lookup[];
  CommonCaseStatus: Lookup[];
  CommonStatus: Lookup[];
  ConsultationCategory: Lookup[];
  ContractLocationType: Lookup[];
  ContractStatus: Lookup[];
  ContractType: Lookup[];
  CoordinationType: Lookup[];
  Currency: Lookup[];
  CustomsExemptionRequestType: Lookup[];
  DeductionRatioItemArea: Lookup[];
  DeductionRatioItemPermitType: Lookup[];
  Domain: Lookup[];
  EmploymentCategory: Lookup[];
  EmploymentRequestType: Lookup[];
  ErrorCodes: Lookup[];
  EvaluationResult: Lookup[];
  Experts: Lookup[];
  ExternalServiceRequestType: Lookup[];
  ExternalUserPermissionGroup: Lookup[];
  FieldAssessment: Lookup[];
  FollowUpStatus: Lookup[];
  FollowUpType: Lookup[];
  FundingSourcesCategory: Lookup[];
  GDX_SERVICES: Lookup[];
  Gender: Lookup[];
  GovOccuptionStatus: Lookup[];
  GovOccuptionType: Lookup[];
  GulfCountries: Lookup[];
  HeadQuarterType: Lookup[];
  IdentificationType: Lookup[];
  ImplementingAgencyType: Lookup[];
  InquiryCategory: Lookup[];
  InternalBankCategory: Lookup[];
  InternalBankStatus: Lookup[];
  InternalDepStatus: Lookup[];
  InternalDepType: Lookup[];
  InternalProjectClassification: Lookup[];
  InternalProjectType: Lookup[];
  JobContractType: Lookup[];
  JointReliefStatus: Lookup[];
  LicenseDurationType: Lookup[];
  LicenseStatus: Lookup[];
  LicenseType: Lookup[];
  LICENSING_AUTHORITY: Lookup[];
  LinkedProject: Lookup[];
  LocalizationModule: Lookup[];
  MeetingClassification: Lookup[];
  MeetingReplyStatus: Lookup[];
  MeetingType: Lookup[];
  MembersType: Lookup[];
  MenuItemParameters: Lookup[];
  MenuType: Lookup[];
  MenuView: Lookup[];
  Nationality: Lookup[];
  NPOCurrency: Lookup[];
  NPODecisions: Lookup[];
  NPORequestType: Lookup[];
  NPOStatus: Lookup[];
  officeType: Lookup[];
  OrganizationWay: Lookup[];
  OrgMemberRole: Lookup[];
  OrgStatus: Lookup[];
  PermissionCategory: Lookup[];
  ProfileType: Lookup[];
  ProjectLicenseType: Lookup[];
  ProjectModelingReqType: Lookup[];
  ProjectType: Lookup[];
  ProjectWorkArea: Lookup[];
  ReceiverType: Lookup[];
  RecommendedWay: Lookup[];
  REPORT_WATERMARK: Lookup[];
  ReportStatus: Lookup[];
  RequestClassification: Lookup[];
  RequestTypeNewOnly: Lookup[];
  RequestTypeUpdateOnly: Lookup[];
  ResidenceStatus: Lookup[];
  RiskStatus: Lookup[];
  ServiceActionType: Lookup[];
  ServiceRequestType: Lookup[];
  ServiceRequestTypeNoExtend: Lookup[];
  ServiceRequestTypeNoRenew: Lookup[];
  ShipmentCarrier: Lookup[];
  ShipmentSource: Lookup[];
  SubAidPeriodicType: Lookup[];
  SubApprovalIndicator: Lookup[];
  SubPartialLogAction: Lookup[];
  SubRequestActionLogType: Lookup[];
  SubRequestChannel: Lookup[];
  SubRequestStatus: Lookup[];
  SubRequestType: Lookup[];
  SubSearchActionType: Lookup[];
  TemplateStatus: Lookup[];
  TemplateType: Lookup[];
  TRAINING_ATTENDENCE_METHOD: Lookup[];
  TRAINING_AUDIENCE: Lookup[];
  TRAINING_DOMAIN: Lookup[];
  TRAINING_JOB_TYPE: Lookup[];
  TRAINING_LANG: Lookup[];
  TRAINING_STATUS: Lookup[];
  TRAINING_SURVEY_ANSWER: Lookup[];
  TRAINING_TRAINEE_STATUS: Lookup[];
  TRAINING_TYPE: Lookup[];
  TrainingActivityType: Lookup[];
  TrainingLanguage: Lookup[];
  TrainingWay: Lookup[];
  TransfereeType: Lookup[];
  TransferMethod: Lookup[];
  TransferringIndividualLicenseStatus: Lookup[];
  TransferringIndividualRequestType: Lookup[];
  TransferType: Lookup[];
  UrgentFinancialNotificationAccountType: Lookup[];
  UrgentInterventionAnnouncementRequestType: Lookup[];
  UrgentInterventionFinancialRequestType: Lookup[];
  UrgentInterventionRequestType: Lookup[];
  UsageAdjective: Lookup[];
  UserType: Lookup[];
  WORK_FIELD: Lookup[];
  GeneralProcessType: Lookup[];
  ProjectPermitType: Lookup[];
  SubmissionMechanism: Lookup[];
  ExternalUserUpdateRequestStatus: Lookup[];
  RequestTemplateStatus: Lookup[];
  FinancialTransferType: Lookup[];
  FinancialTransfereeType: Lookup[];
  FinancialTransferRequestType: Lookup[];
  RequestTypeNewUpdate: Lookup[];
  FieldAssessmentServices: Lookup[];
  ApprovalTemplateType: Lookup[];
  InterventionType: Lookup[];
  PageType: Lookup[];
  WORLD_CHECK_ENTITY_TYPE: Lookup[];
  WORLD_CHECK_SEARCH_DECISION: Lookup[];
  WORLD_CHECK_SEARCH_TYPE: Lookup[];
  ReportPeriodicity: Lookup[];
  HalfType: Lookup[];
  QuarterType: Lookup[];
  MeetingInitiator: Lookup[];
  ProfileStatus: Lookup[];
  PriorityType: Lookup[];
  ProposedInspectionTaskType: Lookup[];
  ActualInspectionTaskType: Lookup[];
  TaskNature: Lookup[];
  TaskArea: Lookup[];
  Relation: Lookup[];
  UnknownOrganization: Lookup[];
  InspectionTaskStatus: Lookup[];
  InspectionActivityStatus: Lookup[];
  ActualInspectionTaskStatus: Lookup[];
  ProposedInspectionTaskStatus: Lookup[];
  BannedPersonRequestStatus: Lookup[];
  SourceType: Lookup[];
  SourceClassification: Lookup[];
  LegalNature: Lookup[];
  DocumentType: Lookup[];
  AdditionStatus: Lookup[];
  BannedSearch: Lookup[];
}
