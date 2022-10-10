import {Directive, EventEmitter} from '@angular/core';
import {MultiAttachmentDirective} from '@app/shared/directives/multi-attachment.directive';
import {HasMultiAttachmentContract} from '@contracts/has-multi-attachment-contract';

@Directive({
  selector: '[attachmentHandler]'
})
export class AttachmentHandlerDirective implements HasMultiAttachmentContract {
  attachmentDirectiveList: MultiAttachmentDirective[] = [];
  attachmentHandlerEmitter: EventEmitter<AttachmentHandlerDirective> = new EventEmitter<AttachmentHandlerDirective>();

  constructor() {
  }

  hasMissingRequiredAttachments(): boolean {
    return this.attachmentDirectiveList.some(x => x.hasMissingRequiredAttachments());
  }


}
