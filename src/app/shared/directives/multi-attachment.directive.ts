import { Directive, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { AttachmentTypeService } from "@services/attachment-type.service";
import { AttachmentsComponent } from "@app/shared/components/attachments/attachments.component";
import { AttachmentTypeServiceData } from "@app/models/attachment-type-service-data";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { DialogService } from '@app/services/dialog.service';
import {
  CustomAttachmentPopupComponent
} from "@app/shared/popups/custom-attachment-popup/custom-attachment-popup.component";
import { CustomAttachmentDataContract } from "@contracts/custom-attachment-data-contract";
import { FileNetDocument } from "@app/models/file-net-document";
import { LangService } from "@services/lang.service";

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

  attachments: FileNetDocument[] = [];
  attachmentsMap: Record<number, FileNetDocument | undefined> = {}

  private loadStatus$: Subject<Omit<CustomAttachmentDataContract, 'loadStatus$'>> = new Subject<Omit<CustomAttachmentDataContract, 'loadStatus$'>>()

  constructor(private attachmentTypeService: AttachmentTypeService,
              private lang: LangService,
              private dialog: DialogService) {
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
    this.attachmentsTypes = this.attachmentComponent.multiAttachmentTypes.get(this.identifier) || []
  }

  private listenToLoadedAttachments(): void {
    this.attachmentComponent
      .loadedStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getAttachmentTypes()
        this.getItemAttachments()
        this.loadStatus$.next({
          component: this.attachmentComponent,
          attachmentsTypes: this.attachmentsTypes,
          attachments: this.attachments,
          model: this.model,
          itemId: this.item[this.itemDef],
          identifier: this.identifier
        })
      })
  }

  @HostListener('click')
  openAttachmentsDialog(): void {
    if (!this.item[this.itemDef]) {
      this.dialog.info(this.lang.map.this_action_cannot_be_performed_before_saving_the_request)
      return;
    }
    this.dialog.show<CustomAttachmentDataContract>(CustomAttachmentPopupComponent, {
      loadStatus$: this.loadStatus$,
      component: this.attachmentComponent,
      attachmentsTypes: this.attachmentsTypes,
      attachments: this.attachments,
      model: this.model,
      itemId: this.item[this.itemDef],
      identifier: this.identifier
    })
  }

  getItemAttachments(): void {
    const map = this.attachmentComponent.multiAttachments.get(this.identifier)!
    const attachments = map && map.get(this.item[this.itemDef] as string) || [];
    this.attachmentsMap = attachments.reduce((acc, file) => {
      return { ...acc, [file.attachmentTypeInfo.id!]: file }
    }, {})
    this.attachments = this.attachmentsTypes.map(type => this.attachmentsMap[type.attachmentTypeId] || type.convertToAttachment())
  }
}
