import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { AttachmentTypeService } from "@services/attachment-type.service";
import { AttachmentsComponent } from "@app/shared/components/attachments/attachments.component";
import { AttachmentTypeServiceData } from "@app/models/attachment-type-service-data";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Directive({
  selector: '[multiAttachment]'
})
export class MultiAttachmentDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>()
  @Input()
  identifier!: string
  @Input()
  itemDef: string = 'itemId'
  @Input()
  item!: any
  @Input()
  model: any

  attachmentComponent: AttachmentsComponent

  attachmentsTypes: AttachmentTypeServiceData[] = []

  constructor(private attachmentTypeService: AttachmentTypeService) {
    this.attachmentComponent = this.attachmentTypeService.attachmentsComponent;
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  ngOnInit(): void {
    this.listenToLoadedAttachments()
  }


  private getAttachmentTypes(): void {
    this.attachmentsTypes = this.attachmentComponent.multiAttachmentTypes.filter(item => item.identifier === this.identifier)
  }

  private listenToLoadedAttachments(): void {
    this.attachmentComponent
      .loadedStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getAttachmentTypes()
      })
  }
}
