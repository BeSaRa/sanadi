import {AdminResult} from '@app/models/admin-result';
import {BestPractices} from '@app/models/best-practices';
import {LessonsLearned} from '@app/models/lessons-learned';
import {OfficeEvaluation} from '@app/models/office-evaluation';
import {Stage} from '@app/models/stage';
import {Result} from './result';

export class UrgentInterventionReportResult {


  id!: string;
  createdOn!: string;
  lastModified!: string;
  classDescription!: string;
  creatorInfo  !: AdminResult;
  ouInfo  !: AdminResult;
  mimeType!: string;
  documentTitle!: string;
  lockTimeout!: string;
  lockOwner!: string;
  licenseType  !: number;
  subject!: string;
  serial  !: number;
  fullSerial!: string;
  organizationId  !: number;
  duration  !: number;
  handicappedFemaleBeneficiary  !: number;
  handicappedMaleBeneficiary  !: number;
  directMaleBeneficiaries  !: number;
  directFemaleBeneficiaries  !: number;
  indirectMaleBeneficiaries  !: number;
  indirectFemaleBeneficiaries  !: number;
  beneficiaries0to5!: number;
  beneficiaries5to18!: number;
  beneficiaries19to60!: number;
  beneficiariesOver60!: number;
  interventionTotalCost!: number;
  year  !: number;
  customTerms!: string;
  publicTerms!: string;
  bestPracticesList: BestPractices[] = [];
  lessonsLearnedList: LessonsLearned[] = [];
  officeEvaluationList: OfficeEvaluation[] = [];
  resultList: Result[] = [];
  stageList: Stage[] = [];
  orgInfo  !: AdminResult;
  beneficiaryCountryInfo  !: AdminResult;
  executionCountryInfo  !: AdminResult;
}
