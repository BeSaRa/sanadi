import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { GeneralProcessNotification } from '@app/models/general-process-notification';
import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from '@app/models/admin-result';
import { FormalyTemplateInterceptor } from './formaly-template-interceptor';
import { FormalyTemplate } from '@app/models/formaly-template';

const formalyTemplateInterceptor = new FormalyTemplateInterceptor();

export class GeneralProcessNotificationInterceptor implements IModelInterceptor<GeneralProcessNotification> {
  receive(model: GeneralProcessNotification): GeneralProcessNotification {
    model.subTeam && (model.subTeam = AdminResult.createInstance(model.subTeam));
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);
    model.departmentInfo && (model.departmentInfo = AdminResult.createInstance(model.departmentInfo));
    model.mainClassInfo && (model.mainClassInfo = AdminResult.createInstance(model.mainClassInfo));
    model.subClassInfo && (model.subClassInfo = AdminResult.createInstance(model.subClassInfo));
    model.processTypeInfo && (model.processTypeInfo = AdminResult.createInstance(model.processTypeInfo));
    GeneralProcessNotificationInterceptor.getDynamicTemplate(model);
    return model;
  }
  send(model: any): GeneralProcessNotification {
    (model.followUpDate && (model.followUpDate = DateUtils.getDateStringFromDate(model.followUpDate)));
    GeneralProcessNotificationInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GeneralProcessNotification>): void {
    delete model.subTeam;
    delete model.searchFields;
    delete model.requestTypeInfo;
    delete model.departmentInfo;
    delete model.mainClassInfo;
    delete model.subClassInfo;
    delete model.processTypeInfo;
  }

  private static getDynamicTemplate(model: GeneralProcessNotification){
    try {
      model.dynamicForm = JSON.parse(model.template);
    } catch (error) {
      model.dynamicForm =[];
    }
    model.dynamicForm = model.dynamicForm.map(x=>formalyTemplateInterceptor.receive(new FormalyTemplate().clone(x)))
  }
}
