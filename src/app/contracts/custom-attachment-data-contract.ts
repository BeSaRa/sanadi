import { AttachmentTypeServiceData } from "@app/models/attachment-type-service-data";
import { CaseModel } from "@app/models/case-model";
import { FileNetDocument } from "@app/models/file-net-document";
import { AttachmentsComponent } from "@app/shared/components/attachments/attachments.component";
import { Subject } from "rxjs";

export interface CustomAttachmentDataContract {
  loadStatus$: Subject<Omit<CustomAttachmentDataContract, 'loadStatus$'>>
  component: AttachmentsComponent
  itemId: string;
  identifier: string
  attachments: FileNetDocument[];
  attachmentsTypes: AttachmentTypeServiceData[];
  model: CaseModel<any, any>;
}
