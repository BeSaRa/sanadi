import {Directive, EventEmitter} from '@angular/core';
import {HasAttachmentHandlerContract} from '@contracts/has-attachment-handler-contract';
import {AttachmentHandlerDirective} from '@app/shared/directives/attachment-handler.directive';

@Directive()
export abstract class HasAttachmentHandlerDirective implements HasAttachmentHandlerContract {
 abstract attachmentHandlerDirective?: AttachmentHandlerDirective;
 abstract attachmentHandlerEmitter: EventEmitter<AttachmentHandlerDirective>;

  hasMissingRequiredAttachments(): boolean {
    return !!(this.attachmentHandlerDirective && this.attachmentHandlerDirective?.hasMissingRequiredAttachments());
  }
}
