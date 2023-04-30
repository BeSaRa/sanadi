import { TemplateFieldTypes } from '@app/enums/template-field-types.enum';
import { DateUtils } from '@app/helpers/date-utils';
import { FormalyTemplate } from '@app/models/formaly-template';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class FormalyTemplateInterceptor implements IModelInterceptor<FormalyTemplate>{
  receive(model: FormalyTemplate): FormalyTemplate {
    FormalyTemplateInterceptor.setComparisonValue(model);
    return model;
  }

  send(model: Partial<FormalyTemplate>): Partial<FormalyTemplate> {

    delete model.langService;
    delete model.comparisonValue;
    return model;
  }

  private static setComparisonValue(model: FormalyTemplate) {
    model.comparisonValue = model.value;
    // if(model.type === TemplateFieldTypes.selectField || model.type === TemplateFieldTypes.yesOrNo){
    //   model.comparisonValue = model.options.find(x=>x.id === model.value)?.name;
    // }
    if(model.type === TemplateFieldTypes.dateField){
      model.comparisonValue = DateUtils.getTimeStampFromDate(model.value);
    }
  }
}
