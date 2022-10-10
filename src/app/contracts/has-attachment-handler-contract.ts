import {AttachmentHandlerDirective} from '@app/shared/directives/attachment-handler.directive';

export interface HasAttachmentHandlerContract {
  attachmentHandlerDirective?: AttachmentHandlerDirective; // read it as @ViewChild in component
}
