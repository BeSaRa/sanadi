import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DatepickerOptionsMap, ReadinessStatus} from '@app/types/types';
import {BehaviorSubject, Subject} from 'rxjs';
import {BankBranch} from '@app/models/bank-branch';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DateUtils} from '@helpers/date-utils';
import { BankBranchPopupComponent } from './bank-branch-popup/bank-branch-popup.component';

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

  listDataSource: BehaviorSubject<BankBranch[]> = new BehaviorSubject<BankBranch[]>([]);
  columns = ['fullName', 'email', 'fax', 'phone', 'recordNo', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  editIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<BankBranch | null> = new Subject<BankBranch | null>();
  private currentRecord?: BankBranch;

  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;

  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
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

      this._updateList(branch, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.viewOnly = false;
      this.recordChanged$.next(null);
    });
  }

  private _updateList(record: (BankBranch | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else if (operation === 'UPDATE') {
        this.list.splice(gridIndex, 1, record);
      } else if (operation === 'DELETE') {
        this.list.splice(gridIndex, 1);
      }
    }
    this.list = this.list.slice();
    this.listDataSource.next(this.list);
  }

  cancelBranch() {
    this.resetBranchForm();
    this._setComponentReadiness('READY');
    this.editIndex = -1;
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

  editBranch($event: MouseEvent, record: BankBranch, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view($event: MouseEvent, record: BankBranch, index: number) {
    $event.preventDefault();
    this.editIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  deleteBranch($event: MouseEvent, record: BankBranch, index: number): any {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._updateList(record, 'DELETE', index);
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }
  _getPopupComponent() {
    return BankBranchPopupComponent;
  }

  openFormPopup() {
    this.dialogService.show(this._getPopupComponent(), {
      form : this.form,
      readonly : this.readonly,
      editIndex : this.editIndex,
      model : this.currentRecord,
      branchesFormArray : this.branchesFormArray,
      viewOnly : this.viewOnly,
      datepickerOptionsMap : this.datepickerOptionsMap,

    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.saveBranch()
      } else {
        this.cancelBranch();
      }
    })
  }
}
