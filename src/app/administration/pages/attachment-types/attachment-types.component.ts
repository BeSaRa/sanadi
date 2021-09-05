import {Component, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {Subscription} from 'rxjs';
import {AttachmentType} from '@app/models/attachment-type';
import {AttachmentTypeService} from '@app/services/attachment-type.service';
import {FormControl} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {cloneDeep as _deepClone} from 'lodash';
import {ToastService} from '@app/services/toast.service';

@Component({
  selector: 'attachment-types',
  templateUrl: './attachment-types.component.html',
  styleUrls: ['./attachment-types.component.scss']
})
export class AttachmentTypesComponent implements OnInit {
  list: AttachmentType[] = [];
  columns = ['rowSelection', 'arName', 'enName', 'status', 'actions'];
  filter: FormControl = new FormControl();
  reloadSubscription!: Subscription;
  selectedRecords: AttachmentType[] = [];
  actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  private _addSelected(record: AttachmentType): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: AttachmentType): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.list.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length === this.list.length;
  }

  isSelected(record: AttachmentType): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: AttachmentType): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  onSelectAll(): void {
    if (this.selectedRecords.length === this.list.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.list);
    }
  }

  constructor(public lang: LangService,
              private attachmentTypeService: AttachmentTypeService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService) {
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.attachmentTypeService.loadComposite().subscribe(data => {
      this.list = data;
    });
  }

  reload() {
    this.selectedRecords = [];
    this.load();
  }

  filterCallback(data: AttachmentType, text: string): boolean {
    return data.arName.toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
      data.enName.toLowerCase().indexOf(text.toLowerCase()) !== -1;
  }

  add(): void {
    const sub = this.attachmentTypeService.openCreateDialog().onAfterClose$.subscribe(() => {
      this.reload();
      sub.unsubscribe();
    });
  }

  edit(attachmentType: AttachmentType, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.attachmentTypeService.openUpdateDialog(attachmentType.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload();
        sub.unsubscribe();
      });
    });
  }

  delete(event: MouseEvent, model: AttachmentType): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload();
          sub.unsubscribe();
        });
      }
    });
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.attachmentTypeService.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.reload();
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }
}
