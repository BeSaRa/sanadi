import {Trainee} from '@app/models/trainee';
import {Lookup} from '@app/models/lookup';
import {TraineeInterceptor} from '@app/model-interceptors/trainee-interceptor';
import {InterceptModel} from '@decorators/intercept-model';

const interceptor = new TraineeInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class TraineeData {
  id!: number;
  acceptanceTime!: string;
  enrollmentTime!: string;
  isAttended!: boolean;
  isCertificateReady!: boolean;
  status!: number;
  statusInfo!: Lookup;
  trainingProgramId!: number;
  refusalComment?: string;
  addedByRACA!: boolean;
  trainee!: Trainee;
  surveyURL?: string;
}
