import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LangService } from "@services/lang.service";
import { CountryService } from "@services/country.service";
import { ToastService } from "@services/toast.service";
import { DialogService } from "@services/dialog.service";
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { ManagementCouncil } from "@app/models/management-council";
import { Country } from "@app/models/country";
import { ReadinessStatus } from "@app/types/types";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { UserClickOn } from "@app/enums/user-click-on.enum";

@Component({
  selector: 'management-council',
  templateUrl: './management-council.component.html',
  styleUrls: ['./management-council.component.scss']
})
export class ManagementCouncilComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private countryService: CountryService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fb: UntypedFormBuilder) {
  }

  private _list: ManagementCouncil[] = [];
  @Input() set list(list: ManagementCouncil[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): ManagementCouncil[] {
    return this._list;
  }

  @Input() countriesList: Country[] = [];
  @Input() readonly: boolean = false;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<ManagementCouncil[]> = new BehaviorSubject<ManagementCouncil[]>([]);
  columns = ['arabicName', 'englishName', 'email', 'phone', 'mobileNo', 'actions'];
  viewOnly: boolean = false;
  editIndex: number = -1;
  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<ManagementCouncil | null> = new Subject<ManagementCouncil | null>();
  private current?: ManagementCouncil;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;

  ngOnInit(): void {
    this.dataSource.next(this.list);
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

  private buildForm() {
    this.form = this.fb.group({
      managementCouncils: this.fb.array([])
    })
  }

  get managementCouncilsFormArray(): UntypedFormArray {
    return (this.form.get('managementCouncils')) as UntypedFormArray;
  }

  addAllowed(): boolean {
    return !this.readonly;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.changed$.next(new ManagementCouncil())
      })
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$))
      .subscribe(council => {
        // if (this.readonly) {
        //   return;
        // }
        this.current = council || undefined;
        this.updateForm(this.current);
      })
  }

  private updateForm(record: ManagementCouncil | undefined) {
    const managementCouncilsFormArray = this.managementCouncilsFormArray;
    managementCouncilsFormArray.clear();

    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      managementCouncilsFormArray.push(this.fb.group((record.getManagementCouncilFields(true))));
      if (this.readonly || this.viewOnly) {
        this.managementCouncilsFormArray.disable();
      }
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
      return this.form.get('managementCouncils.0') as AbstractControl;
    }));

    const validForm$ = form$.pipe(filter((form) => form.valid));
    const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.form.get('managementCouncils')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('managementCouncils.0')) as UntypedFormArray;
      }),
      map((form) => {
        return (new ManagementCouncil()).clone({
          ...this.current, ...form.getRawValue()
        });
      })
    ).subscribe((managementCouncil: ManagementCouncil) => {
      if (!managementCouncil) {
        return;
      }

      this._updateList(managementCouncil, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.changed$.next(null);
    });
  }

  private _updateList(record: (ManagementCouncil | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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

  edit($event: MouseEvent, record: ManagementCouncil, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.viewOnly = false;
    this.changed$.next(record);
  }

  view($event: MouseEvent, record: ManagementCouncil, index: number) {
    $event.preventDefault();
    this.editIndex = index;
    this.viewOnly = true;
    this.changed$.next(record);
  }

  delete($event: MouseEvent, record: ManagementCouncil, index: number): any {
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
    this.managementCouncilsFormArray.clear();
    this.managementCouncilsFormArray.markAsUntouched();
    this.managementCouncilsFormArray.markAsPristine();
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
