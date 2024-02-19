import { DateUtils } from '@app/helpers/date-utils';
import { GdxMoiPersonal } from '@app/models/gdx-moi-personal';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class GdxMoiPersonalInterceptor implements IModelInterceptor<GdxMoiPersonal> {
  receive(model: GdxMoiPersonal): GdxMoiPersonal {
    model.arbName1 = model.arbName1??'';
    model.arbName2 = model.arbName2??'';
    model.arbName3 = model.arbName3??'';
    model.arbName4 = model.arbName4??'';
    model.arbName5 = model.arbName5??'';
    model.engName1 = model.engName1??'';
    model.engName2 = model.engName2??'';
    model.engName3 = model.engName3??'';
    model.engName4 = model.engName4??'';
    model.engName5 = model.engName5??'';
    model.birthDate = DateUtils.changeDateToDatepicker(model.birthDateStr)
    return model;
  }

  send(model: Partial<GdxMoiPersonal>): Partial<GdxMoiPersonal> {
    return model;
  }
}
