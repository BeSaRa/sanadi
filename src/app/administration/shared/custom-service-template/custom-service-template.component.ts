import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CaseTypes } from '@app/enums/case-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { CustomServiceTemplate } from '@app/models/custom-service-template';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CustomServiceTemplateService } from '@app/services/custom-service-template.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { SharedService } from '@app/services/shared.service';
import { ToastService } from '@app/services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { CustomServiceTemplatePopupComponent } from '../../popups/custom-service-template-popup/custom-service-template-popup.component';

@Component({
  selector: 'custom-service-template',
  templateUrl: './custom-service-template.component.html',
  styleUrls: ['./custom-service-template.component.scss']
})
export class CustomServiceTemplateComponent implements OnInit {

  constructor(public lang: LangService,
    private toastService: ToastService,
    private customServiceTemplate: CustomServiceTemplateService,
    private dialogService: DialogService,
    private sharedService: SharedService,
    private fb: UntypedFormBuilder) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  private _list: CustomServiceTemplate[] = [];

  @Input() set list(list: CustomServiceTemplate[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): CustomServiceTemplate[] {
    return this._list;
  }

  @Input() readOnly: boolean = false;
  @Input() caseType!: CaseTypes;

  caseTypes = CaseTypes;

  dataSource: BehaviorSubject<CustomServiceTemplate[]> = new BehaviorSubject<CustomServiceTemplate[]>([]);
  columns = ['arabicName', 'englishName', 'actions'];

  editItem?: CustomServiceTemplate;
  viewOnly: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<CustomServiceTemplate | null> =
    new Subject<CustomServiceTemplate | null>();
  private current?: CustomServiceTemplate;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;

  actions: IMenuItem<CustomServiceTemplate>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: CustomServiceTemplate) => this.edit(item),
      show: (_item: CustomServiceTemplate) => !this.readOnly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: CustomServiceTemplate) => this.delete(item),
      show: (_item: CustomServiceTemplate) => !this.readOnly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: CustomServiceTemplate) => this.view(item),
    },
    // download document
    {
      type: 'action',
      icon: ActionIconsEnum.DOWNLOAD,
      label: 'btn_download',
      onClick: (item: CustomServiceTemplate) => this.loadTemplate(item),
    }
  ];
  ngOnInit(): void {
    this.dataSource.next(this.list);
    this.buildForm();
    this.listenToAdd();
    this.listenToChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }

  private loadTemplate(row: CustomServiceTemplate) {
    this.customServiceTemplate.loadTemplateDocId(this.caseType, row.id).subscribe((result) => {
      if (result.blob.size === 0) {
        return;
      }
      this.sharedService.downloadFileToSystem(result.blob)
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private buildForm() {
    this.form = this.fb.group(
      new CustomServiceTemplate().buildForm(true)
    );
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.changed$.next(new CustomServiceTemplate());
    });
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.current = record || undefined;
      this.updateForm(this.current);
    });
  }

  private updateForm(record: CustomServiceTemplate | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.openFormDialog()
    } else {
      this._setComponentReadiness('READY');
    }
  }
  _getDialog() {
    return CustomServiceTemplatePopupComponent;
  }
  openFormDialog() {
    this.dialogService.show(this._getDialog(), {
      readOnly: this.readOnly,
      viewOnly: this.viewOnly,
      form: this.form,
      model: this.current,
      caseType: this.caseType,
      editItem: this.editItem,
    }).onAfterClose$.subscribe((data) => {
      if(data) {
        this.save(data);
      } else {
        this.cancel();
      }
    })
  }
  save(data: {model: CustomServiceTemplate, file: File}) {
    if (this.readOnly || this.viewOnly) {
      return;
    }
    this.save$.next(data);
  }
  private displayRequiredFieldsMessage(): void {
    this.dialogService
      .error(this.lang.map.msg_all_required_fields_are_filled)
      .onAfterClose$.pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }
  private listenToSave() {
    this.save$
      .pipe(
        takeUntil(this.destroy$),
        tap((_) =>
          this.form.invalid ? this.displayRequiredFieldsMessage() : true
        ),
        filter(() => this.form.valid),
        filter(() => {
          const formValue = this.form.getRawValue();
          const isDuplicate = this.list.some((x) => x === formValue);
          if (isDuplicate) {
            this.toastService.alert(this.lang.map.msg_duplicated_item);
          }
          return !isDuplicate;
        })
      )
      .pipe(switchMap((data) => {
        if(this.current?.id) {
          if(data.file) {
            return this.customServiceTemplate.updateContent(this.caseType, data.model, data.file)
          } else {
            return this.customServiceTemplate.updateProp(this.caseType, data.model)
          }
        } else {
          return this.customServiceTemplate.addTemplate(this.caseType, data.model, data.file)
        }
      }))
      .subscribe((record: CustomServiceTemplate) => {
        if (!record) {
          return;
        }
        this._updateList(record, !!this.editItem ? 'UPDATE' : 'ADD');
        this.toastService.success(this.lang.map.msg_save_success);
        this.changed$.next(null);
        this.cancel();
      });

  }

  private _updateList(
    record: CustomServiceTemplate | null,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE',
  ) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else {
        let index = !this.editItem ? -1 : this.list.findIndex(x => x === this.editItem);
        if (operation === 'UPDATE') {
          this.list.splice(index, 1, record);
        } else if (operation === 'DELETE') {
          this.list.splice(index, 1);
        }
      }
    }
    this.list = this.list.slice();
  }

  edit(record: CustomServiceTemplate, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readOnly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.changed$.next(record);
  }

  view(record: CustomServiceTemplate, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.changed$.next(record);
  }

  delete(record: CustomServiceTemplate, $event?: MouseEvent): any {
    $event?.preventDefault();
    if (this.readOnly) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.editItem = record;
          this._updateList(record, 'DELETE');
          this.toastService.success(this.lang.map.msg_delete_success);
          this.cancel();
        }
      });
  }
  cancel() {
    this.resetForm();
    this.editItem = undefined;
    this.viewOnly = false;
    this._setComponentReadiness('READY');
  }

  private resetForm() {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  forceClearComponent() {
    this.cancel();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }
}
