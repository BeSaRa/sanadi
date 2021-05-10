import {SanadiDocument} from './sanadi-document';
import {Observable} from 'rxjs';
import {AttachmentService} from '../services/attachment.service';
import {FactoryService} from '../services/factory.service';
import {AdminResult} from './admin-result';
import {printBlobData} from '../helpers/utils';

export class SanadiAttachment extends SanadiDocument {
  attachmentType!: number;
  requestId!: number;
  requestFullSerial!: string;

  //extra properties
  attachmentService: AttachmentService;
  attachmentTypeInfo?: AdminResult;

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

  downloadAttachment($event: MouseEvent): void {
    $event?.preventDefault();
    this.attachmentService.loadByVsIdAsBlob(this.vsId)
      .subscribe((data) => {
        printBlobData(data, 'Attachment_' + this.documentTitle);
      });
  }
}
