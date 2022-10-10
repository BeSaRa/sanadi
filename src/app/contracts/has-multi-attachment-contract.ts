import {QueryList} from '@angular/core';
import {HasAttachmentHandlerContract} from '@contracts/has-attachment-handler-contract';

export interface HasMultiAttachmentContract {
  hasMissingRequiredAttachments(): boolean;
  attachmentHandlers?: QueryList<HasAttachmentHandlerContract>
}
