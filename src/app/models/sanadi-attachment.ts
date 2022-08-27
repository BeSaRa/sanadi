import { SanadiDocument } from './sanadi-document';
import { Observable } from 'rxjs';
import { AttachmentService } from '@services/attachment.service';
import { FactoryService } from '@services/factory.service';
import { AdminResult } from './admin-result';
import { printBlobData } from '@helpers/utils';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { InterceptModel } from "@decorators/intercept-model";
import { SanadiAttachmentInterceptor } from "@app/model-interceptors/sanadi-attachment-interceptor";

const { send, receive } = new SanadiAttachmentInterceptor();

@InterceptModel({ send, receive })
export class SanadiAttachment extends SanadiDocument<SanadiAttachment> {
  attachmentType!: number;
  requestId!: number;
  requestFullSerial!: string;

  //extra properties
  attachmentService: AttachmentService;
  attachmentTypeInfo?: AdminResult;
  lastModifiedString: string = '';

  searchFields: ISearchFieldsMap<SanadiAttachment> = {
    ...normalSearchFields(['documentTitle', 'lastModifiedString']),
    ...infoSearchFields(['attachmentTypeInfo'])
  }

  constructor() {
    super();
    this.attachmentService = FactoryService.getService('AttachmentService');
  }

  getDocClassName(): string {
    return 'SanadiAttachment';
  }

  deleteByVsId(): Observable<boolean> {
    return this.attachmentService.deleteByVsId(this.vsId);
  }

  downloadAttachment($event?: MouseEvent): void {
    $event?.preventDefault();
    this.attachmentService.loadByVsIdAsBlob(this.vsId)
      .subscribe((data) => {
        printBlobData(data, 'Attachment_' + this.documentTitle);
      });
  }
}
