import {TemplateFieldTypes} from '@app/enums/template-field-types.enum';
import {DateUtils} from '@app/helpers/date-utils';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import { TemplateField } from '@app/models/template-field';

export class TemplateFieldInterceptor implements IModelInterceptor<TemplateField> {
  receive(model: TemplateField): TemplateField {
    TemplateFieldInterceptor.setComparisonValue(model);
    return model;
  }

  send(model: Partial<TemplateField>): Partial<TemplateField> {
    delete model.langService;
    delete model.comparisonValue;
    return model;
  }

  private static setComparisonValue(model: TemplateField) {
    model.comparisonValue = model.value;
    if (model.type === TemplateFieldTypes.dateField) {
      model.comparisonValue = DateUtils.getTimeStampFromDate(model.value  as string);
    }
  }
}
