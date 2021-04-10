import {AdminResult} from './admin-result';

class AppError {
  eo!: AdminResult;
}

export class CustomHttpErrorResponse {
  error!: AppError;

  getError(): any {
    return this.error.eo.getName();
  }
}
