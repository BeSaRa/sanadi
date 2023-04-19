import { FinancialTransfersProject } from '@app/models/financial-transfers-project';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class FinancialTransferProjectsInterceptor
  implements IModelInterceptor<FinancialTransfersProject>
{
  receive(model: FinancialTransfersProject): FinancialTransfersProject {

    return model;
  }

  send(
    model: Partial<FinancialTransfersProject>
  ): Partial<FinancialTransfersProject> {

    FinancialTransferProjectsInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(
    model: Partial<FinancialTransfersProject>
  ): void {

  }
}
