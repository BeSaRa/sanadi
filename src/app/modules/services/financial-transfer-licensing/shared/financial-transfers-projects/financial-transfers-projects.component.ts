import { catchError, filter, map, switchMap, take, takeUntil, tap, debounceTime, exhaustMap } from 'rxjs/operators';
import {ExternalProjectLicensing} from '@models/external-project-licensing';
import {FinancialTransferLicensingService} from '@services/financial-transfer-licensing.service';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {CommonStatusEnum} from '@enums/common-status.enum';
import {UserClickOn} from '@enums/user-click-on.enum';
import {AdminResult} from '@models/admin-result';
import {FinancialTransfersProject} from '@models/financial-transfers-project';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import {ReadinessStatus} from '@app/types/types';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {CustomValidators} from '@app/validators/custom-validators';
import { FinancialTransferRequestTypes } from '@app/enums/service-request-types';
import { FinancialTransfersProjectsPopupComponent } from './financial-transfers-projects-popup/financial-transfers-projects-popup.component';

@Component({
  selector: 'financial-transfers-projects',
  templateUrl: './financial-transfers-projects.component.html',
  styleUrls: ['./financial-transfers-projects.component.scss'],
})
export class FinancialTransfersProjectsComponent implements OnInit {
  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              public lookupService: LookupService,
              private fb: UntypedFormBuilder,
              private financialTransferLicensingService: FinancialTransferLicensingService) {
  }

  @Input() readonly: boolean = false;
  private _list: FinancialTransfersProject[] = [];

  @Input() set list(list: FinancialTransfersProject[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  @Input() financialTransfersProject?: string = undefined;

  get list(): FinancialTransfersProject[] {
    return this._list;
  }

  @Output() listUpdated = new EventEmitter<number>();
  @Input() submissionMechanism!: number;
  @Input() approvedFinancialTransferProjects: ExternalProjectLicensing[] = [];
  @Input() requestType:number = FinancialTransferRequestTypes.NEW;

  financialTransferProjectControl!: UntypedFormControl;
  totalQatariRiyalTransactions = 0;
  lastQatariTransactionAmountValue:any;
  showForm: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  commonStatusEnum = CommonStatusEnum;
  inputMaskPatterns = CustomValidators.inputMaskPatterns

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<FinancialTransfersProject[]> =
    new BehaviorSubject<FinancialTransfersProject[]>([]);
  columns: (keyof FinancialTransfersProject | 'actions')[] = [
    'fullSerial',
    'qatariTransactionAmount',
    'notes',
    'actions',
  ];

  editItem?: FinancialTransfersProject;
  add$: Subject<any> = new Subject<any>();
  viewOnly: boolean = false;

  private save$: Subject<any> = new Subject<any>();

  private recordChanged$: Subject<FinancialTransfersProject | null> =
    new Subject<FinancialTransfersProject | null>();
  private current?: FinancialTransfersProject;
  private destroy$: Subject<any> = new Subject<any>();
  selectedProject?: FinancialTransfersProject;

  form!: UntypedFormGroup;

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToChange();
    this.listenToSave();
    this._listenToFinancialTransferProjectChange();
    this._calculateQatariTransactionAmount();
    this._setComponentReadiness('READY');
    this._listenQatariTransactionAmountChange();
  }
  private _listenQatariTransactionAmountChange() {
    this.qatariTransactionAmount.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      filter(_=>this.requestType === FinancialTransferRequestTypes.UPDATE),
      filter(_=>!!this.financialTransferProjectControl.value),
      filter(value=> !!value),
      filter(value =>  this.lastQatariTransactionAmountValue !== value ),
      debounceTime(500),
      switchMap(transactionAmount => {
        this.lastQatariTransactionAmountValue = transactionAmount;
        return this.financialTransferLicensingService
        .loadEternalProjectsDetails(this.financialTransferProjectControl.value,transactionAmount)
        .pipe(
          catchError(_ => of(null)),
        )
      })


    ) .subscribe((project: FinancialTransfersProject | null) => {
      if (!project) {
        return;
      }
     this.selectedProject = project
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private buildForm() {
    this.form = this.fb.group(
      new FinancialTransfersProject().getFormFields(true)
    );
    this.financialTransferProjectControl = this.fb.control([]);
  }

  actions: IMenuItem<FinancialTransfersProject>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: FinancialTransfersProject) => this.edit(item),
      show: (_item: FinancialTransfersProject) => !this.readonly,
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: FinancialTransfersProject) => this.delete(item),
      show: (_item: FinancialTransfersProject) => !this.readonly,
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: FinancialTransfersProject) => this.view(item),
      show: (_item: FinancialTransfersProject) => this.readonly,
    },
  ];

  addAllowed(): boolean {
    return !this.readonly && !this.showForm;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.recordChanged$.next(new FinancialTransfersProject());
    });
  }

  private listenToChange() {
    this.recordChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((FinancialTransfersProject) => {
        this.current = FinancialTransfersProject || undefined;
        this.showForm = !!this.current;
        this.updateForm(this.current);
      });
  }

  private updateForm(record: FinancialTransfersProject | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.openFormPopup();
      this.form.patchValue(record);
      this.lastQatariTransactionAmountValue = this.qatariTransactionAmount.value
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      } else {
        this.form.enable()
      }

    } else {
      this._setComponentReadiness('READY');
    }
  }

  save() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
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
          const isProjectSelected = !!this.selectedProject;
          if (!isProjectSelected) {
            this.toastService.alert(this.lang.map.msg_select_project_required);
          }
          return isProjectSelected;
        }),
        filter(() => {
          const isQatariTransactionAmountValid = this.qatariTransactionAmount.value <= this.selectedProject!.dueAmount
          if (!isQatariTransactionAmountValid) {
            this.toastService.error(this.lang.map.msg_qatari_transaction_should_not_exceed_due_amount);
          }
          return isQatariTransactionAmountValid;
        }),
        filter(() => {
          if (!!this.editItem) {
            return true;
          }
          const formValue = this.form.getRawValue();
          const isDuplicate = this.list.some(
            (x) => x.fullSerial === formValue.fullSerial
          );
          if (isDuplicate) {
            this.toastService.alert(this.lang.map.msg_duplicated_item);
          }
          return !isDuplicate;
        }),
        map(() => {
          let formValue = this.form.getRawValue();
          return new FinancialTransfersProject().clone({
            ...formValue,
            dueAmount: this.selectedProject!.dueAmount,
            transferAmount: this.selectedProject!.transferAmount,
            projectTotalCost: this.selectedProject!.projectTotalCost,
            remainingAmount: this.selectedProject!.remainingAmount,
          });
        })
      )
      .subscribe((FinancialTransfersProject: FinancialTransfersProject) => {
        if (!FinancialTransfersProject) {
          return;
        }
        this._updateList(
          FinancialTransfersProject,
          !!this.editItem ? 'UPDATE' : 'ADD'
        );
        this.toastService.success(this.lang.map.msg_save_success);
        this.recordChanged$.next(null);
        this.cancel();
      });
  }

  private displayRequiredFieldsMessage(): void {
    this.dialogService
      .error(this.lang.map.msg_all_required_fields_are_filled)
      .onAfterClose$.pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }

  private _updateList(
    record: FinancialTransfersProject | null,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE'
  ) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else {
        let index = !this.editItem
          ? -1
          : this.list.findIndex((x) => x === this.editItem);
        if (operation === 'UPDATE') {
          this.list.splice(index, 1, record);
        } else if (operation === 'DELETE') {
          this.list.splice(index, 1);
        }
      }
    }
    this.list = this.list.slice();
    this._calculateQatariTransactionAmount();
    this.listUpdated.emit(this.totalQatariRiyalTransactions);
  }

  private _calculateQatariTransactionAmount() {
    this.totalQatariRiyalTransactions = this.list
      .map((record) => Number(record.qatariTransactionAmount))
      .reduce((prev, current) => prev + current, 0);
  }

  private _prepareForm(record: FinancialTransfersProject) {
    this.editItem = record;
    this.selectedProject = record;
    const approvedProject = this.approvedFinancialTransferProjects.find(x => x.fullSerial === record.fullSerial);
    this.financialTransferProjectControl.patchValue(approvedProject?.id, {emitEvent: false, onlySelf: true});
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  edit(record: FinancialTransfersProject, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this._prepareForm(record);
  }

  view(record: FinancialTransfersProject, $event?: MouseEvent) {
    $event?.preventDefault();
    this._prepareForm(record);
  }

  delete(record: FinancialTransfersProject, $event?: MouseEvent): any {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$.pipe(take(1))
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
    this.showForm = false;
    this.viewOnly = false;
    this.editItem = undefined;
    this._setComponentReadiness('READY');
  }

  private resetForm() {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
    this.financialTransferProjectControl.reset();
    this.selectedProject = undefined;
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

  isTransferAmountGreaterThenDueAmount(record: FinancialTransfersProject): boolean {
    return record.transferAmount > record.dueAmount
  }

  trackBy(item: AdminResult) {
    return item.id;
  }

  get fullSerial(): UntypedFormControl {
    return this.form.get('fullSerial') as UntypedFormControl;
  }

  get qatariTransactionAmount(): UntypedFormControl {
    return this.form.get('qatariTransactionAmount') as UntypedFormControl;
  }
  get transferAmount(): UntypedFormControl {
    return this.form.get('transferAmount') as UntypedFormControl;
  }

  get notes(): UntypedFormControl {
    return this.form.get('notes') as UntypedFormControl;
  }

  private _listenToFinancialTransferProjectChange() {
    this.financialTransferProjectControl.valueChanges
      .pipe(
        filter(value => !!value),
        switchMap((value: string) => {

          const qatariTransactionAmount = this.requestType === FinancialTransferRequestTypes.UPDATE ?
          this.qatariTransactionAmount.value : undefined;
          return this.financialTransferLicensingService.loadEternalProjectsDetails(value,qatariTransactionAmount)
            .pipe(
              catchError(_ => of(null)),
            )
        }),

        takeUntil(this.destroy$)
      )
      .subscribe((project: FinancialTransfersProject | null) => {
        if (!project) {
          this.financialTransferProjectControl.reset();
          return;
        }

        this.form.patchValue({...project,qatariTransactionAmount:this.qatariTransactionAmount.value});
        this.selectedProject = project
      });
  }
  _getPopupComponent() {
    return FinancialTransfersProjectsPopupComponent;
  }
  openFormPopup() {
    this.dialogService.show(this._getPopupComponent(), {
      form : this.form,
      readonly : this.readonly,
      editItem : this.editItem,
      model : this.current,
      financialTransferProjectControl : this.financialTransferProjectControl,
      approvedFinancialTransferProjects : this.approvedFinancialTransferProjects,
      selectedProject : this.selectedProject,
        }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save()
      } else {
        this.cancel();
      }
    })
  }
}
