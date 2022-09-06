import { Lookup } from '@app/models/lookup';
import { filter, map, takeUntil,take } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, UntypedFormControl } from '@angular/forms';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { EffectiveCoordinationCapabilities } from '@app/models/effective-coordination-capabilities';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DatepickerOptionsMap, ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { OrgUnit } from '@app/models/org-unit';
import { DateUtils } from '@app/helpers/date-utils';
import { IMyInputFieldChanged } from 'angular-mydatepicker';

@Component({
  selector: 'effective-coordination-capabilities',
  templateUrl: './effective-coordination-capabilities.component.html',
  styleUrls: ['./effective-coordination-capabilities.component.scss']
})
export class EffectiveCoordinationCapabilitiesComponent implements OnInit {

  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: FormBuilder,
  ) {}
  formArrayName: string = "effectiveCoordinationCapabilities";
  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  @Input() orgId!:number|undefined;

  allowListUpdate:boolean=true;

  private _list: EffectiveCoordinationCapabilities[] = [];
  @Input() set list(list: EffectiveCoordinationCapabilities[]) {
    if( this.allowListUpdate === true){
      this._list = list;
      this.listDataSource.next(this._list);
    }
  }
  model: EffectiveCoordinationCapabilities = new EffectiveCoordinationCapabilities();
  get list(): EffectiveCoordinationCapabilities[] {
    return this._list;
  }
  @Input() readonly: boolean = false;
  @Input() pageTitleKey: keyof ILanguageKeys = "effective_coordination_capabilities";

  listDataSource: BehaviorSubject<EffectiveCoordinationCapabilities[]> = new BehaviorSubject<
  EffectiveCoordinationCapabilities[]
  >([]);
  columns = this.model.DisplayedColumns;

  editIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<EffectiveCoordinationCapabilities | null> =
    new Subject<EffectiveCoordinationCapabilities | null>();
  private currentRecord?: EffectiveCoordinationCapabilities;

  private destroy$: Subject<any> = new Subject<any>();

  form!: FormGroup;
  @Input() organizationWayes:Lookup[]=[];
  @Input() organizationUnits:OrgUnit[]=[];
  datepickerOptionsMap: DatepickerOptionsMap = {
    eventStartDate: DateUtils.getDatepickerOptions({ disablePeriod: "past" }),
  };
  @Input()canUpdate:boolean=true;
  @Input()isClaimed:boolean=false;
  get formArray(): FormArray {
    return this.form.get(this.formArrayName) as FormArray;
  }
  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
    this._setComponentReadiness("READY");
    if(this.canUpdate === false){
      this.columns= this.columns.slice(0,this.columns.length-1);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  buildForm(): void {
    this.form = this.fb.group({
      [this.formArrayName]: this.fb.array([]),
    });
  }
  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.recordChanged$.next(new EffectiveCoordinationCapabilities());
    });
  }
  private listenToRecordChange() {
    this.recordChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((record) => {
        if(record)record.organizationId=this.orgId;
        this.currentRecord = record || undefined;
        this.updateForm(this.currentRecord);
      });
  }
  private updateForm(model: EffectiveCoordinationCapabilities | undefined) {
    const formArray = this.formArray;
    formArray.clear();
    if (model) {
      if (this.viewOnly) {
        this._setComponentReadiness("READY");
      } else {
        this._setComponentReadiness("NOT_READY");
      }
      formArray.push(this.fb.group(new EffectiveCoordinationCapabilities().clone(model).BuildForm(true)));
      if (this.readonly || this.viewOnly) {
        this.formArray.disable();
      }
    } else {
      this._setComponentReadiness("READY");
    }
  }
  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }
  private listenToSave() {
    const form$ = this.save$.pipe(
      map(() => {
        return this.form.get(`${this.formArrayName}.0`) as AbstractControl;
      })
    );

    const validForm$ = form$.pipe(filter((form) => form.valid));
    const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$.pipe(take(1))
        .subscribe(() => {
          this.form.get(this.formArrayName)?.markAllAsTouched();
        });
    });

    validForm$
      .pipe(
        takeUntil(this.destroy$),
        map(() => {
          return this.form.get(`${this.formArrayName}.0`) as FormArray;
        }),
        map((form) => {
          return new EffectiveCoordinationCapabilities().clone({
            ...this.currentRecord,
            ...form.getRawValue(),
          });
        })
      )
      .subscribe((model: EffectiveCoordinationCapabilities) => {
        if (!model) {
          return;
        }
        this._updateList(
          model,
          this.editIndex > -1 ? "UPDATE" : "ADD",
          this.editIndex
        );
        this.toastService.success(this.lang.map.msg_save_success);
        this.editIndex = -1;
        this.viewOnly = false;
        this.recordChanged$.next(null);
      });
  }
  private _updateList(record: (EffectiveCoordinationCapabilities | null),
   operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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
  addAllowed(): boolean {
    return !this.readonly;
  }
  onSave() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }
  onCancel() {
    this.resetForm();
    this._setComponentReadiness('READY');
    this.editIndex = -1;
  }
  private resetForm() {
    this.formArray.clear();
    this.formArray.markAsUntouched();
    this.formArray.markAsPristine();
  }
  view($event: MouseEvent, record: EffectiveCoordinationCapabilities, index: number) {
    $event.preventDefault();
    this.editIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete($event: MouseEvent, record: EffectiveCoordinationCapabilities, index: number): any {
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
  edit($event: MouseEvent, record: EffectiveCoordinationCapabilities, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  get searchStartDate() {
    return this.form.controls.searchStartDate as UntypedFormControl
  }
  get searchSubmissionDeadline() {
    return this.form.controls.searchSubmissionDeadline as UntypedFormControl;
  }
  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        searchStartDate: this.searchStartDate,
        searchSubmissionDeadline: this.searchSubmissionDeadline
      }
    });
  }
}
