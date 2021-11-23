import {Trainee} from '@app/models/trainee';

export class TraineeData {
  id!: number;
  acceptanceTime!: string;
  enrollmentTime!: string;
  isAttended!: boolean;
  status!: number;
  trainingProgramId!: number;
  trainee!: Trainee;
}
