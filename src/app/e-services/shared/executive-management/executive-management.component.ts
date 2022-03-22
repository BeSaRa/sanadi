import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {CountryService} from '@app/services/country.service';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Country} from '@app/models/country';
import {ReadinessStatus} from '@app/types/types';
import {BehaviorSubject, Subject} from 'rxjs';
import {ExecutiveManagement} from '@app/models/executive-management';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {JobTitleService} from '@app/services/job-title.service';
import {JobTitle} from '@app/models/job-title';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';

@Component({
  selector: 'executive-management',
  templateUrl: './executive-management.component.html',
  styleUrls: ['./executive-management.component.scss']
})
export class ExecutiveManagementComponent implements OnInit {

  constructor(public lang: LangService,
              private countryService: CountryService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private jobTitleService: JobTitleService,
              private fb: FormBuilder) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  private _list: ExecutiveManagement[] = [];
  @Input() set list(list: ExecutiveManagement[]) {
    this._list = list;
    this.listDataSource.next(this._list);
  }

  get list(): ExecutiveManagement[] {
    return this._list;
  }
  @Input() countriesList: Country[] = [];
  @Input() readonly: boolean = false;
  @Input() pageTitleKey: keyof ILanguageKeys = 'managers';

  listDataSource: BehaviorSubject<ExecutiveManagement[]> = new BehaviorSubject<ExecutiveManagement[]>([]);
  columns = ['arabicName', 'englishName', 'email', 'phone', 'actions'];

  editIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<ExecutiveManagement | null> = new Subject<ExecutiveManagement | null>();
  private currentRecord?: ExecutiveManagement;

  private destroy$: Subject<any> = new Subject<any>();

  form!: FormGroup;

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
    this.form = this.fb.group({
      managers: this.fb.array([])
    });
  }

  addManagerAllowed(): boolean {
    return !this.readonly;
  }

  get managersFormArray(): FormArray {
    return (this.form.get('managers')) as FormArray;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new ExecutiveManagement());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((manager) => {
      /*if (this.readonly) {
        return;
      }*/
      this.currentRecord = manager || undefined;
      this.updateManagerForm(this.currentRecord);
    });
  }

  private updateManagerForm(manager: ExecutiveManagement | undefined) {
    const managersFormArray = this.managersFormArray;
    managersFormArray.clear();
    if (manager) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      managersFormArray.push(this.fb.group(manager.getManagerFields(true)));
      if (this.readonly || this.viewOnly) {
        this.managersFormArray.disable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  saveManager() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }

  private listenToSave() {
    const managerForm$ = this.save$.pipe(map(() => {
      return this.form.get('managers.0') as AbstractControl;
    }));

    const validForm$ = managerForm$.pipe(filter((form) => form.valid));
    const invalidForm$ = managerForm$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.form.get('managers')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('managers.0')) as FormArray;
      }),
      map((form) => {
        return (new ExecutiveManagement()).clone({
          ...this.currentRecord, ...form.getRawValue()
        });
      })
    ).subscribe((manager: ExecutiveManagement) => {
      if (!manager) {
        return;
      }

      this._updateList(manager, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.viewOnly = false;
      this.recordChanged$.next(null);
    });
  }

  private _updateList(record: (ExecutiveManagement | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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

  cancelManager() {
    this.resetManagerForm();
    this._setComponentReadiness('READY');
    this.editIndex = -1;
  }

  private resetManagerForm() {
    this.managersFormArray.clear();
    this.managersFormArray.markAsUntouched();
    this.managersFormArray.markAsPristine();
  }

  forceClearComponent() {
    this.cancelManager();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }

  editManager($event: MouseEvent, record: ExecutiveManagement, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view($event: MouseEvent, record: ExecutiveManagement, index: number) {
    $event.preventDefault();
    this.editIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  deleteManager($event: MouseEvent, record: ExecutiveManagement, index: number): any {
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

}
