import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {ReadinessStatus} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {catchError, filter, map, take, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {Beneficiary} from '@app/models/beneficiary';
import {TableComponent} from '@app/shared/components/table/table.component';
import {BeneficiaryFamilyMember} from '@models/beneficiary-family-member';
import {AidLookup} from '@models/aid-lookup';
import {AidTypes} from '@enums/aid-types.enum';
import {AidLookupStatusEnum} from '@enums/status.enum';
import {AidLookupService} from '@services/aid-lookup.service';
import {Lookup} from '@models/lookup';

@Component({
  selector: 'beneficiary-family-members',
  templateUrl: './beneficiary-family-members.component.html',
  styleUrls: ['./beneficiary-family-members.component.scss']
})
export class BeneficiaryFamilyMemberComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(public lang: LangService,
              private lookupService: LookupService,
              private aidLookupService: AidLookupService,
              private fb: UntypedFormBuilder,
              private dialogService: DialogService,
              private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadMainAidLookups();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }

  ngAfterViewInit() {
    if (this.readonly) {
      this.columns.splice(this.columns.indexOf('actions'), 1);
    }
    this._setFooterLabelColspan();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  form!: UntypedFormGroup;
  @ViewChild('table') table!: TableComponent;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  @Input() readonly: boolean = false;
  @Input() beneficiary?: Beneficiary;

  private _list: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  @Input()
  set list(value: BeneficiaryFamilyMember[]) {
    this._list.next(value);
  }

  get list(): BeneficiaryFamilyMember[] {
    return this._list.value;
  }

  headerColumn: string[] = ['extra-header'];
  columns = [
    'primaryIdNumber',
    'primaryIdType',
    'arName',
    'relativeType',
    'occuption',
    'actions'
  ];
  footerLabelColSpan: number = 0;
  primaryIdTypeList: Lookup[] = this.lookupService.listByCategory.BenIdType;
  GenderList: Lookup[] = this.lookupService.listByCategory.Gender.slice().sort(
    (a, b) => a.lookupKey - b.lookupKey
  );
  benRequestorRelationType: Lookup[] = this.lookupService.listByCategory.BenRequestorRelationType.slice().sort(
    (a, b) => a.lookupKey - b.lookupKey
  );
  mainAidLookupsList: AidLookup[] = [];
  subAidLookupsList: AidLookup[] = [];
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  filterControl: UntypedFormControl = new UntypedFormControl('');
  viewOnly: boolean = false;
  customValidators = CustomValidators;

  add$: Subject<any> = new Subject<any>();
  editItem?: BeneficiaryFamilyMember;
  private save$: Subject<void> = new Subject<void>();
  private recordChanged$: Subject<BeneficiaryFamilyMember | null> = new Subject<BeneficiaryFamilyMember | null>();
  private currentRecord?: BeneficiaryFamilyMember;
  private destroy$: Subject<void> = new Subject();

  showForm: boolean = false;

  actions: IMenuItem<BeneficiaryFamilyMember>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: BeneficiaryFamilyMember) => this.edit(item),
      show: (_item: BeneficiaryFamilyMember) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: BeneficiaryFamilyMember) => this.delete(item),
      show: (_item: BeneficiaryFamilyMember) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: BeneficiaryFamilyMember) => this.view(item),
      show: (_item: BeneficiaryFamilyMember) => this.readonly
    }
  ];

  buildForm(): void {
    let model = new BeneficiaryFamilyMember().clone(this.currentRecord);
    this.form = this.fb.group(model.buildForm(true));
  }

  private _setFooterLabelColspan(): void {
    if (this.readonly) {
      this.footerLabelColSpan = this.columns.length - 1;
    } else {
      this.footerLabelColSpan = this.columns.length - 2;
    }
  }

  private loadMainAidLookups() {
    this.mainAidLookupsList = [];
    return this.aidLookupService.loadByCriteria({
      aidType: AidTypes.MAIN_CATEGORY,
      status: AidLookupStatusEnum.ACTIVE
    }).pipe(
      catchError(() => of([]))
    ).subscribe((list) => {
      this.mainAidLookupsList = list;
    });
  }
  handleMainAidChange($event: number) {
    this.requestedAidField.reset();
    this.loadSubAidLookups($event);
  }

  private loadSubAidLookups(mainAidId: number) {
    this.subAidLookupsList = [];

    this.loadSubAidsByMainAidId(mainAidId).subscribe(list => {
      this.subAidLookupsList = list;
    });
  }

  private loadSubAidsByMainAidId(mainAidId: number): Observable<AidLookup[]> {
    if (!mainAidId) {
      return of([]);
    }
    return this.aidLookupService.loadByCriteria({
      aidType: AidTypes.SUB_CATEGORY,
      status: AidLookupStatusEnum.ACTIVE,
      parent: mainAidId
    }).pipe(
      catchError(() => of([]))
    );
  }
  isTouchedOrDirty(): boolean {
    return this.form && (this.form.touched || this.form.dirty);
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new BeneficiaryFamilyMember());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.showForm = !!this.currentRecord;
      this.updateForm(this.currentRecord);
    });
  }

  save() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
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
      map(() => {
        let formValue = this.form.getRawValue();
        return (new BeneficiaryFamilyMember()).clone({
          ...this.currentRecord, ...formValue,

          primaryIdTypeInfo: this.lookupService.listByCategory.BenIdType.find(x => x.lookupKey === formValue.primaryIdType) || new Lookup(),
          relativeTypeInfo: this.lookupService.listByCategory.BenRequestorRelationType.find(x => x.lookupKey === formValue.relativeType) || new Lookup(),
        });
      })
    ).subscribe(recordToSave => {
      debugger
      this._updateList(recordToSave, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  private updateForm(record: BeneficiaryFamilyMember | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.form.patchValue(record);
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  cancelForm() {
    this.resetForm();
    this.showForm = false;
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
  }

  edit(record: BeneficiaryFamilyMember, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: BeneficiaryFamilyMember, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: BeneficiaryFamilyMember, $event?: MouseEvent): any {
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

  private _updateList(record: (BeneficiaryFamilyMember | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
    if (record) {
      let index = !this.editItem ? -1 : this.list.findIndex(x => x === this.editItem);
      if (operation === 'ADD') {
        this.list.push(record);
      } else if (operation === 'UPDATE') {
        let index = this.list.findIndex(x => x === this.editItem);
        this.list.splice(index, 1, record);
      } else if (operation === 'DELETE') {
        this.list.splice(index, 1);
      }
    }
    this.list = this.list.slice();
  }


  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  get requestedAidField(): UntypedFormControl {
    return this.form.get('aidLookupId') as UntypedFormControl;
  }
}
