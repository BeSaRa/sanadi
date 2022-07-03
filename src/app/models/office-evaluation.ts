import {AdminResult} from '@app/models/admin-result';

export class OfficeEvaluation {
  evaluationHub!: number;
  evaluationResult!: number;
  notes!: string;
  evaluationHubInfo!: AdminResult;
  evaluationResultInfo!: AdminResult;
}
