import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {ToastService} from "@app/services/toast.service";
import {DialogService} from "@app/services/dialog.service";
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ReadinessStatus} from "@app/types/types";
import {BehaviorSubject, Subject} from "rxjs";
import {filter, map, take, takeUntil} from "rxjs/operators";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {Goal} from "@app/models/goal";
import {Lookup} from "@app/models/lookup";
import {CustomValidators} from "@app/validators/custom-validators";
import {LookupService} from "@app/services/lookup.service";
import {LookupCategories} from '@app/enums/lookup-categories';
import {Domains} from "@app/enums/domains.enum";
import {WorkFieldService} from "@app/services/work-field.service";
import {WorkField} from "@app/models/work-field";
import {AdminResult} from "@app/models/admin-result";
import {indexOf} from "lodash";

@Component({
  selector: 'goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss']
})
export class GoalComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              public lookupService: LookupService,
              private ochaDacClassfService: WorkFieldService,
              private fb: FormBuilder) {
  }

  @Input() readonly: boolean = false;
  @Input() list: Goal[] = [];
  domainsList: Lookup[] = this.lookupService.listByCategory.Domain;
  mainDACCategoriesList: AdminResult[] = [];
  mainUNOCHACategoriesList: AdminResult[] = [];
  displayByDomain: "DAC" | "OCHA" | null = null;
  LookupCategories = LookupCategories;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<Goal[]> = new BehaviorSubject<Goal[]>([]);
  columns = ['goal', 'domain', 'mainDACCategory', 'mainUNOCHACategory', 'workArea', 'actions'];

  editIndex: number = -1;
  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<Goal | null> = new Subject<Goal | null>();
  private current?: Goal;
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;

  ngOnInit(): void {
    this.dataSource.next(this.list);
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
    this.loadOCHADACClassifications();
  }

  private buildForm() {
    this.form = this.fb.group({
      goals: this.fb.array([])
    })
  }

  addAllowed(): boolean {
    return !this.readonly;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.changed$.next(new Goal())
      })
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$))
      .subscribe(goal => {
        if (this.readonly) {
          return;
        }
        this.current = goal || undefined;
        this.updateForm(this.current);
      })
  }

  private updateForm(record: Goal | undefined) {
    const goalsFormArray = this.goalsFormArray;
    goalsFormArray.clear();
    this.displayByDomain = null;

    if (record) {
      this._setComponentReadiness('NOT_READY');
      goalsFormArray.push(this.fb.group((record.getGoalFields(true))));
      this.listenToDomainChange();
      this.listenToMainOUCHAChange();
      this.listenToMainDACChange();
      this.domainField.updateValueAndValidity();
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
      return this.form.get('goals.0') as AbstractControl;
    }));

    const validForm$ = form$.pipe(filter((form) => form.valid));
    const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.form.get('goals')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('goals.0')) as FormArray;
      }),
      map((form) => {
        return (new Goal()).clone({
          ...this.current, ...form.getRawValue()
        });
      })
    ).subscribe((goal: Goal) => {
      if (!goal) {
        return;
      }

      this._updateList(goal, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.changed$.next(null);
    });
  }

  private _updateList(record: (Goal | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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

  edit($event: MouseEvent, record: Goal, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.changed$.next(record);
  }

  delete($event: MouseEvent, record: Goal, index: number): any {
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
    this.goalsFormArray.clear();
    this.goalsFormArray.markAsUntouched();
    this.goalsFormArray.markAsPristine();
  }

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  private listenToMainOUCHAChange() {
    /*this.mainUNOCHACategoryInfoField.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: WorkField) => {
        if (!value) {
          return;
        }
      })*/
  }

  private listenToMainDACChange(): void {
    this.mainDACCategoryInfoField.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (!value) {
          return;
        }
      })
  }

  private listenToDomainChange(): void {
    this.domainField?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value === Domains.DEVELOPMENT) {
          this.displayByDomain = 'DAC';
          this.mainDACCategoryInfoField.setValidators([CustomValidators.required]);
          this.mainUNOCHACategoryInfoField.setValidators([]);
          this.mainUNOCHACategoryInfoField.setValue(null);
        } else if (value === Domains.HUMAN) {
          this.displayByDomain = 'OCHA';
          this.mainUNOCHACategoryInfoField.setValidators([CustomValidators.required]);
          this.mainDACCategoryInfoField.setValidators([]);
          this.mainDACCategoryInfoField.setValue(null);
        }

        this.mainDACCategoryInfoField.updateValueAndValidity();
        this.mainUNOCHACategoryInfoField.updateValueAndValidity();
      });
  }

  forceClearComponent() {
    this.cancel();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }

  private loadOCHADACClassifications() {
    return this.ochaDacClassfService.load()
      .pipe(
        map(ouchaDACList => {
          return ouchaDACList.filter(ouchaDac => {
            const adminResultInstance = AdminResult.createInstance({
              id: ouchaDac.id,
              arName: ouchaDac.arName,
              enName: ouchaDac.enName
            })
            if (ouchaDac.type === Domains.HUMAN) {
              this.mainUNOCHACategoriesList.push(adminResultInstance);
            } else if (ouchaDac.type === Domains.DEVELOPMENT) {
              this.mainDACCategoriesList.push(adminResultInstance);
            }

            return ouchaDac;
          });
        })).subscribe(result => {
      })
  }


  get goalsFormArray(): FormArray {
    return (this.form.get('goals')) as FormArray;
  }

  get domainField(): FormControl {
    return this.goalsFormArray.get('0.domain') as FormControl;
  }

  get mainDACCategoryInfoField(): FormControl {
    return this.goalsFormArray.get('0.mainDACCategoryInfo') as FormControl;
  }

  get mainUNOCHACategoryInfoField(): FormControl {
    return this.goalsFormArray.get('0.mainUNOCHACategoryInfo') as FormControl;
  }

  trackBy(item: AdminResult) {
    console.log(item);
    return item.id;
  }
}
