import { Directive, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { AttachmentTypeService } from '@services/attachment-type.service';
import { AttachmentsComponent } from '@app/shared/components/attachments/attachments.component';
import { AttachmentTypeServiceData } from '@app/models/attachment-type-service-data';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { DialogService } from '@app/services/dialog.service';
import {
  CustomAttachmentPopupComponent
} from '@app/shared/popups/custom-attachment-popup/custom-attachment-popup.component';
import { CustomAttachmentDataContract } from '@contracts/custom-attachment-data-contract';
import { FileNetDocument } from '@app/models/file-net-document';
import { LangService } from '@services/lang.service';
import { isEmptyObject } from '@helpers/utils';
import { AttachmentHandlerDirective } from '@app/shared/directives/attachment-handler.directive';
import { HasMissingRequiredAttachmentsContract } from '@contracts/has-missing-required-attachments-contract';

@Directive({
  selector: '[multiAttachment]'
})
export class MultiAttachmentDirective implements OnInit, OnDestroy, HasMissingRequiredAttachmentsContract {
  private destroy$ = new Subject<void>();
  @Input()
  identifier!: string;
  @Input()
  itemDef: string = 'itemId';
  @Input()
  item!: any;
  @Input()
  model: any;

  customPropertiesDestroy$: Subject<void> = new Subject<void>();

  attachmentComponent: AttachmentsComponent;

  attachmentsTypes: AttachmentTypeServiceData[] = [];

  attachments: FileNetDocument[] = [];
  attachmentsMap: Record<number, FileNetDocument | undefined> = {};
  @Input()
  formObservables: Record<string, () => Observable<any>> = {};

  private loadStatus$: Subject<Omit<CustomAttachmentDataContract, 'loadStatus$'>> = new Subject<Omit<CustomAttachmentDataContract, 'loadStatus$'>>();
  // used to get the updated attachments from the popup
  private attachmentsUpdated$: Subject<FileNetDocument[]> = new Subject<FileNetDocument[]>()

  private conditionalAttachments: FileNetDocument[] = [];

  constructor(private attachmentHandler: AttachmentHandlerDirective,
              private attachmentTypeService: AttachmentTypeService,
              private lang: LangService,
              private dialog: DialogService) {
    this.attachmentComponent = this.attachmentTypeService.attachmentsComponent;
    this.attachmentHandler.attachmentDirectiveList.push(this);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.customPropertiesDestroy$.next();
    this.customPropertiesDestroy$.complete();
    this.customPropertiesDestroy$.unsubscribe();
    this.attachmentHandler.attachmentDirectiveList = this.attachmentHandler.attachmentDirectiveList.filter(item => item !== this);
  }

  ngOnInit(): void {
    this.listenToLoadedAttachments();
    this.listenToUpdatedAttachmentsFromPopup();
  }


  private getAttachmentTypes(): void {
    this.attachmentsTypes = this.attachmentComponent.multiAttachmentTypes.get(this.identifier) || [];
  }

  private listenToLoadedAttachments(): void {
    this.attachmentComponent
      .loadedStatus$
      .pipe(filter(val => !!val))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getAttachmentTypes();
        this.getItemAttachments();
        this.emitAttachmentsData();
      });
  }

  private emitAttachmentsData(): void {
    this.loadStatus$.next({
      attachmentsUpdated$: this.attachmentsUpdated$,
      component: this.attachmentComponent,
      attachmentsTypes: this.attachmentsTypes,
      attachments: this.attachments,
      model: this.model,
      itemId: this.item[this.itemDef],
      identifier: this.identifier
    });
  }

  @HostListener('click')
  openAttachmentsDialog(): void {
    if (!this.item[this.itemDef]) {
      this.dialog.info(this.lang.map.this_action_cannot_be_performed_before_saving_the_request);
      return;
    }
    this.dialog.show<CustomAttachmentDataContract>(CustomAttachmentPopupComponent, {
      attachmentsUpdated$: this.attachmentsUpdated$,
      loadStatus$: this.loadStatus$,
      component: this.attachmentComponent,
      attachmentsTypes: this.attachmentsTypes,
      attachments: this.attachments,
      model: this.model,
      itemId: this.item[this.itemDef],
      identifier: this.identifier
    });
  }

  getItemAttachments(): void {
    // emit to ignore latest observers
    this.customPropertiesDestroy$.next();

    const map = this.attachmentComponent.multiAttachments.get(this.identifier)!;
    const attachments = map && map.get(this.item[this.itemDef] as string) || [];
    this.conditionalAttachments = [];
    this.attachmentsMap = attachments.reduce((acc, file) => {
      return { ...acc, [file.attachmentTypeInfo.id!]: file };
    }, {});
    this.attachments = this.attachmentsTypes.map(type => {
      return (this.attachmentsMap[type.attachmentTypeId] || type.convertToAttachment()).setAttachmentTypeServiceData(type);
    }).filter((attachment) => {
      if (attachment.attachmentTypeServiceData && isEmptyObject(attachment.attachmentTypeServiceData.parsedCustomProperties)) {
        return true;
      }
      this.conditionalAttachments = this.conditionalAttachments.concat(attachment);
      return false;
    });
    // start checking the custom properties
    this.conditionalAttachments.forEach(attachment => {
      this.listenToFormPropertiesChange(attachment);
    });
  }

  private listenToFormPropertiesChange(attachment: FileNetDocument): void {
    const keys = Object.keys(this.formObservables);
    combineLatest(keys.map(key => this.formObservables[key]().pipe(map(value => ({ [key]: value })))))
      .pipe(map(values => {
        return values.reduce((acc, currentValue) => {
          return { ...acc, ...currentValue };
        }, {} as Record<string, number>);
      }))
      .pipe(takeUntil(this.customPropertiesDestroy$))
      .pipe(map((values: Record<string, number>) => {
        return attachment.notMatchExpression(values);
      }))
      .subscribe((notMatch) => {
        notMatch ? this.removeAttachment(attachment) : this.addAttachment(attachment);
        this.emitAttachmentsData();
      });
  }

  private removeAttachment(attachment: FileNetDocument): void {
    this.attachments = this.attachments.filter(item => item.attachmentTypeId !== attachment.attachmentTypeId);
  }

  private addAttachment(attachment: FileNetDocument): void {
    this.attachments = this.attachments.concat(attachment);
  }

  hasMissingRequiredAttachments(): boolean {
    return this.attachments.some(attachment => attachment.required && !attachment.id);
  }

  private listenToUpdatedAttachmentsFromPopup(): void {
    this.attachmentsUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((attachments) => {
        this.attachments = attachments
      })
  }
}
