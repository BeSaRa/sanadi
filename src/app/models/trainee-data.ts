import {Trainee} from '@app/models/trainee';
import {Lookup} from '@app/models/lookup';

export class TraineeData {
  id!: number;
  acceptanceTime!: string;
  enrollmentTime!: string;
  isAttended!: boolean;
  status!: number;
  statusInfo!: Lookup;
  trainingProgramId!: number;
  refusalComment?: string;
  addedByRACA!: boolean;
  trainee!: Trainee;
}
