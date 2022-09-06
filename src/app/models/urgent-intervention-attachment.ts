import {CustomValidators} from '@app/validators/custom-validators';
import {UrgentInterventionAttachmentInterceptor} from '@app/model-interceptors/urgent-intervention-attachment-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {Cloner} from '@app/models/cloner';
import {mixinFileNetDocument} from '@app/mixins/mixin-filenet-document';
import {FileNetDocumentContract} from '@contracts/file-net-document.contract';
import {FileNetDocumentInterceptor} from '@app/model-interceptors/file-net-document-interceptor';

const urgentInterventionAttachmentInterceptor = new UrgentInterventionAttachmentInterceptor();

const mixinFileNetDocumentClass = mixinFileNetDocument(Cloner);

const fileNetDocumentInterceptor = new FileNetDocumentInterceptor();

@InterceptModel({
  send: fileNetDocumentInterceptor.send,
  receive: fileNetDocumentInterceptor.receive
})
class FileNet extends mixinFileNetDocumentClass {
}

@InterceptModel({
  send: urgentInterventionAttachmentInterceptor.send,
  receive: urgentInterventionAttachmentInterceptor.receive
})
export class UrgentInterventionAttachment extends FileNet implements FileNetDocumentContract {
  isApproved!: boolean;
  reportId!: number;
  justification!: string;

  //extra properties
  createdOnString!: string;

  constructor() {
    super();
  }

  searchFields: ISearchFieldsMap = {
    ...normalSearchFields(['createdOnString', 'description'])
  };

  buildForm(controls: boolean = false): any {
    const {documentTitle, description} = this;
    return {
      documentTitle: controls ? [documentTitle, [CustomValidators.required, CustomValidators.maxLength(200), CustomValidators.pattern('ENG_AR_NUM_ONLY')]] : documentTitle,
      description: controls ? [description, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    };
  }
}
