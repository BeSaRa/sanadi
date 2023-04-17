import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ImplementingAgency } from '@models/implementing-agency';
import { Subject } from 'rxjs';
import { ReadinessStatus } from '@app/types/types';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { UserClickOn } from '@enums/user-click-on.enum';
import { DialogService } from '@services/dialog.service';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { SortEvent } from '@contracts/sort-event';
import { CommonUtils } from '@helpers/common-utils';
import { InterventionImplementingAgencyListPopupComponent } from '../../popups/intervention-implementing-agency-list-popup/intervention-implementing-agency-list-popup.component';

@Component({
  selector: 'intervention-implementing-agency-list',
  templateUrl: './intervention-implementing-agency-list.component.html',
  styleUrls: ['./intervention-implementing-agency-list.component.scss']
})
export class InterventionImplementingAgencyListComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: UntypedFormBuilder) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  @Input() readonly: boolean = false;
  @Input() executionCountry!: number;

  private _list: ImplementingAgency[] = [];
  @Input() set list(list: ImplementingAgency[]) {
    this._list = list;
  }

  get list(): ImplementingAgency[] {
    return this._list;
  }

  displayedColumns = ['implementingAgencyType', 'implementingAgency', 'actions'];

  editItem?: ImplementingAgency;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<ImplementingAgency | null> = new Subject<ImplementingAgency | null>();
  private currentRecord?: ImplementingAgency;
  private destroy$: Subject<any> = new Subject<any>();
  filterControl: UntypedFormControl = new UntypedFormControl('');

  form!: UntypedFormGroup;

  actions: IMenuItem<ImplementingAgency>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ImplementingAgency) => this.edit(item),
      show: (_item: ImplementingAgency) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ImplementingAgency) => this.delete(item),
      show: (_item: ImplementingAgency) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ImplementingAgency) => this.view(item),
      show: (_item: ImplementingAgency) => this.readonly
    }
  ];

  sortingCallbacks = {
    implementingAgency: (a: ImplementingAgency, b: ImplementingAgency, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.implementingAgencyInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.implementingAgencyInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    implementingAgencyType: (a: ImplementingAgency, b: ImplementingAgency, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.agencyTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.agencyTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  buildForm(): void {
    this.form = this.fb.group(new ImplementingAgency().getAgencyFields(true));
  }

  private listenToAdd() {
    this.add$.pipe(
      takeUntil(this.destroy$),
      tap(() => !!this.executionCountry ? true : this.displayMissingCountryMessage()),
      filter(() => !!this.executionCountry)
    ).subscribe(() => {
      this.viewOnly = false;
      this.recordChanged$.next(new ImplementingAgency());
    });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
        this.currentRecord = record || undefined;
      this.updateForm(this.currentRecord);
    });
  }

  _getPopupComponent() {
    return InterventionImplementingAgencyListPopupComponent;
  }
  openFormPopup() {
    this.dialogService.show(this._getPopupComponent(), {
      form: this.form,
      readonly: this.readonly,
      editItem: this.editItem,
      model: this.currentRecord,
      viewOnly: this.viewOnly,
      executionCountry: this.executionCountry,
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save(data)
      } else {
        this.cancelForm();
      }
    })
  }
  private updateForm(record: ImplementingAgency | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.openFormPopup();
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  save(model: ImplementingAgency) {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next(model);
  }

  private displayRequiredFieldsMessage(): void {
    this.dialogService.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }

  private displayMissingCountryMessage(): void {
    this.dialogService.error(this.lang.map.msg_please_select_x_to_continue.change({ x: this.lang.map.execution_country })).onAfterClose$
      .pipe(take(1))
      .subscribe();
  }

  private listenToSave() {
    this.save$.pipe(
      takeUntil(this.destroy$),
      tap(_ => this.form.invalid ? this.displayRequiredFieldsMessage() : true),
      filter(() => this.form.valid),
      filter(() => {
        const formValue = this.form.getRawValue();
        const isDuplicate = this.list.some(x => x.implementingAgency === formValue.implementingAgency && x.implementingAgencyType === formValue.implementingAgencyType);
        if (isDuplicate) {
          this.toastService.alert(this.lang.map.msg_duplicated_item);
          this.openFormPopup();
        }
        return !isDuplicate;
      })
    ).subscribe((agency: ImplementingAgency) => {
      if (!agency) {
        return;
      }
      this._updateList(agency, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  private _updateList(record: (ImplementingAgency | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
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

  cancelForm() {
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

  forceClearComponent() {
    this.cancelForm();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }

  edit(record: ImplementingAgency, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: ImplementingAgency, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: ImplementingAgency, $event?: MouseEvent): any {
    $event?.preventDefault();
    if (this.readonly) {
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
          this.cancelForm();
        }
      });
  }

}
