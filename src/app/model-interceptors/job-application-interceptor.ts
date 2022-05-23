import { JobApplication } from "./../models/job-application";
import { IModelInterceptor } from "@contracts/i-model-interceptor";

export class JobApplicationInterceptor
  implements IModelInterceptor<JobApplication>
{
  send(model: any) {
    return model;
  }

  receive(model: JobApplication): JobApplication {
    return model;
  }
}
