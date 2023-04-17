import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LangService } from "@services/lang.service";
import { ToastService } from "@services/toast.service";
import { DialogService } from "@services/dialog.service";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { ReadinessStatus } from "@app/types/types";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, map, take, takeUntil, tap } from "rxjs/operators";
import { UserClickOn } from "@enums/user-click-on.enum";
import { TargetGroup } from "@models/target-group";
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { TargetGroupPopupComponent } from '../../popups/target-group-popup/target-group-popup.component';

@Component({
  selector: 'target-group',
  templateUrl: './target-group.component.html',
  styleUrls: ['./target-group.component.scss']
})
export class TargetGroupComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fb: UntypedFormBuilder) {
  }

  private _list: TargetGroup[] = [];
  @Input() set list(list: TargetGroup[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): TargetGroup[] {
    return this._list;
  }
  @Input() readonly : boolean = false;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<TargetGroup[]> = new BehaviorSubject<TargetGroup[]>([]);
  columns = ['services', 'targetedGroup', 'actions'];

  editItem?: TargetGroup;
  viewOnly: boolean = false;

  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();
  filterControl: UntypedFormControl = new UntypedFormControl('');
  private changed$: Subject<TargetGroup | null> = new Subject<TargetGroup | null>();
  private current?: TargetGroup;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;
  actions: IMenuItem<TargetGroup>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: TargetGroup) => this.edit(item),
      show: (_item: TargetGroup) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: TargetGroup) => this.delete(item),
      show: (_item: TargetGroup) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: TargetGroup) => this.view(item),
    }
  ];

  ngOnInit(): void {
    this._handleInitData();
    this.buildForm();
    this.listenToAdd();
    this.listenToChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private _handleInitData() {
  }

  private buildForm() {
    this.form = this.fb.group(new TargetGroup().getTargetGroupFields(true))
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.changed$.next(new TargetGroup())

      })
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$))
      .subscribe(targetGroup => {
        this.current = targetGroup || undefined;
        this.updateForm(this.current);
      })
  }

  _getPopupComponent() {
    return TargetGroupPopupComponent;
  }
  openFormDialog() {
    this.dialogService.show(this._getPopupComponent(), {
      viewOnly: this.viewOnly,
      readonly: this.readonly,
      form: this.form,
      editItem: this.editItem,
      model: this.current,
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save(data)
      } else {
        this.cancel()
      }
    })
  }
  private updateForm(record: TargetGroup | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.openFormDialog();
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  save(model: TargetGroup) {
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
  private listenToSave() {
    this.save$.pipe(
      takeUntil(this.destroy$),
      tap(_ => this.form.invalid ? this.displayRequiredFieldsMessage() : true),
      filter(() => this.form.valid),
      filter(() => {
        const formValue = this.form.getRawValue();
        const isDuplicate = this.list.some(x => x.services === formValue.services &&
           x.targetedGroup === formValue.targetedGroup);
        if (isDuplicate) {
          this.toastService.alert(this.lang.map.msg_duplicated_item);
          this.openFormDialog();
        }
        return !isDuplicate;
      })
    ).subscribe((agency: TargetGroup) => {
      if (!agency) {
        return;
      }
      this._updateList(agency, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.changed$.next(null);
      this.cancel();
    });
  }

  private _updateList(record: (TargetGroup | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
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

  edit(record: TargetGroup, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.changed$.next(record);
  }

  view(record: TargetGroup, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.changed$.next(record);
  }

  delete(record: TargetGroup, $event?: MouseEvent): any {
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
