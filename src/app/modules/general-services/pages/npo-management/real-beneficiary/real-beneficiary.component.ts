import { LookupService } from './../../../../../services/lookup.service';
import { DateUtils } from './../../../../../helpers/date-utils';
import { DatepickerOptionsMap } from './../../../../../types/types';
import { Lookup } from './../../../../../models/lookup';
import { JobTitle } from './../../../../../models/job-title';
import { JobTitleService } from '@services/job-title.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LangService } from "@app/services/lang.service";
import { ToastService } from "@app/services/toast.service";
import { DialogService } from "@app/services/dialog.service";
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { ReadinessStatus } from "@app/types/types";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { UserClickOn } from "@app/enums/user-click-on.enum";
import { RealBeneficiary } from "@app/models/real-beneficiary";

@Component({
  selector: 'real-beneficiary',
  templateUrl: './real-beneficiary.component.html',
  styleUrls: ['./real-beneficiary.component.scss']
})
export class RealBeneficiaryComponent implements OnInit, OnDestroy {
  nationalityList: Lookup[] = this.lookupService.listByCategory.Nationality;
  datepickerOptionsMap: DatepickerOptionsMap = {
    birthDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    iDDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    iDExpiryDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    passportDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    passportExpiryDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    startDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    lastUpdateDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    })
  }

  constructor(public lang: LangService,
    private toastService: ToastService,
    private lookupService: LookupService,
    private dialogService: DialogService,
    private fb: UntypedFormBuilder) {
  }

  private _list: RealBeneficiary[] = [];
  @Input() set list(list: RealBeneficiary[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): RealBeneficiary[] {
    return this._list;
  }

  @Input() readonly: boolean = false;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<RealBeneficiary[]> = new BehaviorSubject<RealBeneficiary[]>([]);
  columns = ['actions'];

  editIndex: number = -1;
  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<RealBeneficiary | null> = new Subject<RealBeneficiary | null>();
  private current?: RealBeneficiary;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;

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
    this.form = this.fb.group({
      realBeneficiary: this.fb.array([])
    })
  }

  get realBeneficiaryFormArray(): UntypedFormArray {
    return (this.form.get('realBeneficiary')) as UntypedFormArray;
  }

  addAllowed(): boolean {
    return !this.readonly;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.changed$.next(new RealBeneficiary())
      })
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$))
      .subscribe(beneficiary => {
        if (this.readonly) {
          return;
        }
        this.current = beneficiary || undefined;
        this.updateForm(this.current);
      })
  }

  private updateForm(record: RealBeneficiary | undefined) {
    const realBeneficiaryFormArray = this.realBeneficiaryFormArray;
    realBeneficiaryFormArray.clear();

    if (record) {
      this._setComponentReadiness('NOT_READY');
      realBeneficiaryFormArray.push(this.fb.group((record.getRealBeneficiaryFields(true))));
    } else {
      this._setComponentReadiness('READY');
    }
  }

  save() {
    if (this.readonly) {
      return;
    }
    this.save$.next();
  }

  private listenToSave() {
    const form$ = this.save$.pipe(map(() => {
      return this.form.get('realBeneficiary.0') as AbstractControl;
    }));

    const validForm$ = form$.pipe(filter((form) => form.valid));
    const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.form.get('realBeneficiary')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('realBeneficiary.0')) as UntypedFormArray;
      }),
      map((form) => {
        return (new RealBeneficiary()).clone({
          ...this.current, ...form.getRawValue()
        });
      })
    ).subscribe((realBeneficiary: RealBeneficiary) => {
      if (!realBeneficiary) {
        return;
      }

      this._updateList(realBeneficiary, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.changed$.next(null);
    });
  }

  private _updateList(record: (RealBeneficiary | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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
    this.dataSource.next(this.list);
  }

  edit($event: MouseEvent, record: RealBeneficiary, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.changed$.next(record);
  }

  delete($event: MouseEvent, record: RealBeneficiary, index: number): any {
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

  cancel() {
    this.resetForm();
    this._setComponentReadiness('READY');
    this.editIndex = -1;
  }

  private resetForm() {
    this.realBeneficiaryFormArray.clear();
    this.realBeneficiaryFormArray.markAsUntouched();
    this.realBeneficiaryFormArray.markAsPristine();
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
  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }
  searchNgSelect(term: string, item: any): boolean {
    return item.ngSelectSearch(term);
  }
}
