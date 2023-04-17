import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { DialogService } from '@services/dialog.service';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DatepickerOptionsMap, ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { BankBranch } from '@app/models/bank-branch';
import { map, take, takeUntil } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { DateUtils } from '@helpers/date-utils';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { BankBranchPopupComponent } from '@app/shared/popups/bank-branch-popup/bank-branch-popup.component';

@Component({
  selector: 'bank-branch',
  templateUrl: './bank-branch.component.html',
  styleUrls: ['./bank-branch.component.scss']
})
export class BankBranchComponent implements OnInit {

  constructor(public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: UntypedFormBuilder) {
  }

  private _list: BankBranch[] = [];
  @Input() showHeader: boolean = true;
  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  @Input() readonly: boolean = false;

  // @Input() list: BankBranch[] = [];
  @Input() set list(list: BankBranch[]) {
    this._list = list;
    this.listDataSource.next(this._list);
  }

  get list(): BankBranch[] {
    return this._list;
  }
  actions: IMenuItem<BankBranch>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: BankBranch) => this.edit(item),
      show: (_item: BankBranch) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: BankBranch) => this.delete(item),
      show: (_item: BankBranch) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: BankBranch) => this.view(item)
    }
  ];
  listDataSource: BehaviorSubject<BankBranch[]> = new BehaviorSubject<BankBranch[]>([]);
  columns = ['fullName', 'email', 'fax', 'phone', 'recordNo', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  editItem?: BankBranch;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<BankBranch | null> = new Subject<BankBranch | null>();
  private currentRecord?: BankBranch;

  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;

  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' })
  };

  ngOnInit(): void {
    // this.listDataSource.next(this.list);
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
    this.form = this.fb.group({
      branches: this.fb.array([])
    });
  }

  addBranchAllowed(): boolean {
    return !this.readonly;
  }

  get branchesFormArray(): UntypedFormArray {
    return (this.form.get('branches')) as UntypedFormArray;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new BankBranch());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((branch) => {
      /*if (this.readonly) {
        return;
      }*/
      this.currentRecord = branch || undefined;
      this.updateBranchForm(this.currentRecord);
    });
  }

  private updateBranchForm(branch: BankBranch | undefined) {
    const branchFormArray = this.branchesFormArray;
    branchFormArray.clear();
    if (branch) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.openFormPopup();
      branchFormArray.push(this.fb.group(branch.getBranchFields(true)));
      if (this.readonly || this.viewOnly) {
        this.branchesFormArray.disable();
      } else {
        this.branchesFormArray.enable()
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  saveBranch() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }

  private listenToSave() {
    this.save$.pipe(map(() => {
      return (this.form.get('branches.0')) as AbstractControl;
    })).pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('branches.0')) as UntypedFormArray;
      }),
      map((form) => {
        return (new BankBranch()).clone({
          ...this.currentRecord, ...form.getRawValue()
        });
      })
    ).subscribe((branch: BankBranch) => {
      if (!branch) {
        return;
      }

      this._updateList(branch, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.viewOnly = false;
      this.recordChanged$.next(null);
    });
  }

  private _updateList(record: (BankBranch | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
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
    this.listDataSource.next(this.list);
  }

  cancelBranch() {
    this.resetBranchForm();
    this._setComponentReadiness('READY');
    this.editItem = undefined;
  }

  private resetBranchForm() {
    this.branchesFormArray.clear();
    this.branchesFormArray.markAsUntouched();
    this.branchesFormArray.markAsPristine();
  }

  forceClearComponent() {
    this.cancelBranch();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }

  edit(record: BankBranch, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: BankBranch, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: BankBranch, $event?: MouseEvent): any {
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
          this.cancelBranch();
        }
      });
  }
  _getPopupComponent() {
    return BankBranchPopupComponent;
  }

  openFormPopup() {
    this.dialogService.show(this._getPopupComponent(), {
      form: this.form,
      readonly: this.readonly,
      editItem: this.editItem,
      model: this.currentRecord,
      branchesFormArray: this.branchesFormArray,
      viewOnly: this.viewOnly,
      datepickerOptionsMap: this.datepickerOptionsMap,

    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.saveBranch()
      } else {
        this.cancelBranch();
      }
    })
  }
}
