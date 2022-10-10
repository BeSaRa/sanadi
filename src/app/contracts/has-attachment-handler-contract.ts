import { EventEmitter } from '@angular/core';
import {AttachmentHandlerDirective} from '@app/shared/directives/attachment-handler.directive';

export interface HasAttachmentHandlerContract {
  attachmentHandlerDirective?: AttachmentHandlerDirective; // read it as @ViewChild in component
  attachmentHandlerEmitter: EventEmitter<AttachmentHandlerDirective>; // make this as @Output() and emit on ngAfterInit and pass @ViewChild value
}
