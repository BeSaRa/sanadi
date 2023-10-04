import { QCBStatusEnum } from './../enums/qcb-status-enum';
import { SearchableCloneable } from "@models/searchable-cloneable";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { GdxQCBResponseInterceptor } from '@app/model-interceptors/gdx-qcb-response-interceptor';

const gdxQCBResponseInterceptor = new GdxQCBResponseInterceptor();

@InterceptModel({
  receive: gdxQCBResponseInterceptor.receive
})
export class GdxQCBResponse extends SearchableCloneable<GdxQCBResponse>{
  status: QCBStatusEnum = QCBStatusEnum.REQUEST_NOT_SUBMITTED;

  reportId!: number;
	reportVSID!: string;
	encryptionKey!: string;

}
