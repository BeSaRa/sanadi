import { AdminResult } from '@app/models/admin-result';
import { BestPractices } from '@app/models/best-practices';
import { LessonsLearned } from '@app/models/lessons-learned';
import { OfficeEvaluation } from '@app/models/office-evaluation';
import { Stage } from '@app/models/stage';
import { Result } from './result';
import { ImplementingAgency } from '@app/models/implementing-agency';
import { InterventionRegion } from '@app/models/intervention-region';
import { InterventionField } from '@app/models/intervention-field';
import { InterceptModel } from "@decorators/intercept-model";
import {
  UrgentInterventionAnnouncementResultInterceptor
} from "@app/model-interceptors/urgent-intervention-announcement-result-interceptor";

const { send, receive } = new UrgentInterventionAnnouncementResultInterceptor()

@InterceptModel({ receive, send })
export class UrgentInterventionAnnouncementResult {
  id!: string;
  createdOn!: string;
  lastModified!: string;
  classDescription!: string;
  creatorInfo!: AdminResult;
  ouInfo!: AdminResult;
  mimeType!: string;
  documentTitle!: string;
  contentSize!: number;
  minorVersionNumber!: number;
  majorVersionNumber!: number;
  vsId!: string;
  versionStatus!: number;
  isCurrent!: boolean;
  lockTimeout!: string;
  lockOwner!: string;
  currentVersion!: number;
  currentVersionDate!: string;
  licenseType!: number;
  requestCaseId!: string;
  interventionLicenseId!: string;
  subject!: string;
  serial!: number;
  fullSerial!: string;
  organizationId!: number;
  duration!: number;
  interventionName!: string;
  projectDescription!: string;
  beneficiaryCountry!: number;
  beneficiaryRegion!: string;
  executionCountry!: number;
  executionRegion!: string;
  description!: string;
  licenseStatus!: number;
  handicappedFemaleBeneficiary!: number;
  handicappedMaleBeneficiary!: number;
  directMaleBeneficiaries!: number;
  directFemaleBeneficiaries!: number;
  indirectMaleBeneficiaries!: number;
  indirectFemaleBeneficiaries!: number;
  beneficiaries0to5!: number;
  beneficiaries5to18!: number;
  beneficiaries19to60!: number;
  beneficiariesOver60!: number;
  interventionTotalCost!: number;
  year!: number;
  customTerms!: string;
  publicTerms!: string;
  implementingAgencyList: ImplementingAgency[] = [];
  interventionRegionList: InterventionRegion[] = [];
  interventionFieldList: InterventionField[] = [];
  bestPracticesList: BestPractices[] = [];
  lessonsLearnedList: LessonsLearned[] = [];
  officeEvaluationList: OfficeEvaluation[] = [];
  resultList: Result[] = [];
  stageList: Stage[] = [];
  orgInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;
}
