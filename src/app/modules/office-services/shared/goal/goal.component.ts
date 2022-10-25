import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { DialogService } from '@services/dialog.service';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { Goal } from '@app/models/goal';
import { Lookup } from '@app/models/lookup';
import { CustomValidators } from '@app/validators/custom-validators';
import { LookupService } from '@services/lookup.service';
import { DomainTypes } from '@app/enums/domain-types';
import { AdminResult } from '@app/models/admin-result';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { DacOchaService } from '@services/dac-ocha.service';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { SortEvent } from '@app/interfaces/sort-event';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { AdminLookup } from '@app/models/admin-lookup';
import { InterventionField } from '@app/models/intervention-field';

@Component({
  selector: 'goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss'],
})
export class GoalComponent implements OnInit, OnDestroy {
  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    public lookupService: LookupService,
    private dacOchaService: DacOchaService,
    private fb: UntypedFormBuilder
  ) {}

  @Input() readonly: boolean = false;
  private _list: Goal[] = [];

  @Input() set list(list: Goal[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }
  @Input() goal?:string = undefined;
  get list(): Goal[] {
    return this._list;
  }

  showForm: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  domainsList: Lookup[] = this.lookupService.listByCategory.Domain;
  mainDACCategoriesList: AdminResult[] = [];
  mainUNOCHACategoriesList: AdminResult[] = [];
  displayByDomain: 'DAC' | 'OCHA' | null = null;
  commonStatusEnum = CommonStatusEnum;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<Goal[]> = new BehaviorSubject<Goal[]>([]);
  columns = ['domain', 'mainDACCategory', 'mainUNOCHACategory', 'actions'];

  editItem?: Goal;
  add$: Subject<any> = new Subject<any>();
  viewOnly: boolean = false;

  private save$: Subject<any> = new Subject<any>();

  private recordChanged$: Subject<Goal | null> = new Subject<Goal | null>();
  private current?: Goal;
  private destroy$: Subject<any> = new Subject<any>();

  mainDACCategoryInfo: AdminLookup[] = [];
  mainUNOCHACategoryInfo: AdminLookup[] = [];
  domainInfo: AdminLookup[] = [];
  form!: UntypedFormGroup;

  ngOnInit(): void {
    this._handleInitData();
    this.buildForm();
    this.listenToAdd();
    this.listenToChange();
    this.listenToSave();
    this.listenToGoalChange();
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
    const goal = new Goal();
    this.form = this.fb.group({
      basic: this.fb.group(goal.getGoalsFields(true)),
      goals: this.fb.group(goal.getDomainsFields(true)),
    });
  }
  actions: IMenuItem<Goal>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: Goal) => this.edit(item),
      show: (_item: Goal) => !this.readonly,
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: Goal) => this.delete(item),
      show: (_item: Goal) => !this.readonly,
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: Goal) => this.view(item),
      show: (_item: Goal) => this.readonly,
    },
  ];
  sortingCallbacks = {
    domain: (a: Goal, b: Goal, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a)
          ? ''
          : a.domainInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.domainInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    dac: (a: Goal, b: Goal, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a)
          ? ''
          : a.mainDACCategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.mainDACCategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    unocha: (a: Goal, b: Goal, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a)
          ? ''
          : a.mainUNOCHACategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.mainUNOCHACategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };
  addAllowed(): boolean {
    return !this.readonly && !this.showForm;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.recordChanged$.next(new Goal());
    });
  }

  private listenToChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((goal) => {
      if (this.readonly) {
        return;
      }
      this.current = goal || undefined;
      this.showForm = !!this.current;
      this.updateForm(this.current);
    });
  }

  private updateForm(record: Goal | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.listenToDomainChange();
      this.form.controls.goals.patchValue(record);
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
    this.displayByDomain = null;
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
          const formValue = this.goals.getRawValue();
          const isDuplicate = this.list.some(
            (x) =>
             (x.mainDACCategory === formValue.mainDACCategory )&&
             (x.mainUNOCHACategory === formValue.mainUNOCHACategory)
          );
          if (isDuplicate) {
            this.toastService.alert(this.lang.map.msg_duplicated_item);
          }
          return !isDuplicate;
        }),
        map(() => {
          let formValue = this.goals.getRawValue();
          let domainInfo: AdminResult =
            this.domainsList
              .find((x) => x.lookupKey === formValue.domain)
              ?.convertToAdminResult() ?? new AdminResult();
          let mainDACCategoryInfo: AdminResult =
            this.mainDACCategoriesList.find(
              (x) => x.id === formValue.mainDACCategory
            ) ?? new AdminResult();

          let mainUNOCHACategoryInfo: AdminResult =
            this.mainUNOCHACategoriesList.find(
              (x) => x.id === formValue.mainUNOCHACategory
            ) ?? new AdminResult();

          return new Goal().clone({
            ...this.current,
            ...formValue,
            domainInfo: domainInfo,
            mainUNOCHACategoryInfo: mainUNOCHACategoryInfo,
            mainDACCategoryInfo: mainDACCategoryInfo,
          });
        })
      )
      .subscribe((goal: Goal) => {
        if (!goal) {
          return;
        }
        this._updateList(goal, !!this.editItem ? 'UPDATE' : 'ADD');
        this.toastService.success(this.lang.map.msg_save_success);
        this.recordChanged$.next(null);
        this.cancel();
      });
    // const form$ = this.save$.pipe(map(() => {
    //   return this.form.get('goals.0') as AbstractControl;
    // }));

    // const validForm$ = form$.pipe(filter((form) => form.valid));
    // const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    // invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
    //   this.dialogService
    //     .error(this.lang.map.msg_all_required_fields_are_filled)
    //     .onAfterClose$
    //     .pipe(take(1))
    //     .subscribe(() => {
    //       this.form.get('goals')?.markAllAsTouched();
    //     });
    // });

    // validForm$.pipe(
    //   takeUntil(this.destroy$),
    //   map(() => {
    //     return (this.form.get('goals.0')) as UntypedFormArray;
    //   }),
    //   map((form) => {
    //     return (new Goal()).clone({
    //       ...this.current, ...form.getRawValue()
    //     });
    //   })
    // ).subscribe((goal: Goal) => {
    //   if (!goal) {
    //     return;
    //   }

    //   this._updateList(goal, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
    //   this.toastService.success(this.lang.map.msg_save_success);
    //   this.editIndex = -1;
    //   this.recordChanged$.next(null);
    // });
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
    record: Goal | null,
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

  }

  edit(record: Goal, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: Goal, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: Goal, $event?: MouseEvent): any {
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
    this.form.get('goals')!.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  private listenToDomainChange(): void {
    this.domainField?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value === DomainTypes.DEVELOPMENT) {
          this.displayByDomain = 'DAC';
          this.mainDACCategoryField.setValidators([
            CustomValidators.required,
          ]);
          this.mainUNOCHACategoryField.setValidators([]);
          this.mainUNOCHACategoryField.setValue(null);
        } else if (value === DomainTypes.HUMANITARIAN) {
          this.displayByDomain = 'OCHA';
          this.mainUNOCHACategoryField.setValidators([
            CustomValidators.required,
          ]);
          this.mainDACCategoryField.setValidators([]);
          this.mainDACCategoryField.setValue(null);
        }

        this.mainDACCategoryField.updateValueAndValidity();
        this.mainUNOCHACategoryField.updateValueAndValidity();
      });
  }

  forceClearComponent() {
    this.cancel();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }

  private loadOCHADACClassifications() {
    return this.dacOchaService
      .loadAsLookups()
      .pipe(
        map((list) => {
          return list.filter((model) => !model.parentId);
        }),
        map((result) => {
          return result.filter((record) => {
            if (record.type === DomainTypes.HUMANITARIAN) {
              this.mainUNOCHACategoriesList.push(record.convertToAdminResult());
            } else if (record.type === DomainTypes.DEVELOPMENT) {
              this.mainDACCategoriesList.push(record.convertToAdminResult());
            }
            return record;
          });
        })
      )
      .subscribe(      );
  }

  listenToGoalChange(){
    this.goalInput.valueChanges.pipe(takeUntil(this.destroy$),
      tap(value=>this.goal = value)
    ).subscribe();
  }

  get goals(): UntypedFormGroup {
    return this.form.get('goals') as UntypedFormGroup;
  }
  get goalInput(): UntypedFormControl{
   return this.form.get('basic.goals') as UntypedFormControl
  }
  get domainField(): UntypedFormControl {
    return this.goals.get('domain') as UntypedFormControl;
  }

  get mainDACCategoryField(): UntypedFormControl {
    return this.goals.get(
      'mainDACCategory'
    ) as UntypedFormControl;
  }

  get mainUNOCHACategoryField(): UntypedFormControl {
    return this.goals.get(
      'mainUNOCHACategory'
    ) as UntypedFormControl;
  }

  trackBy(item: AdminResult) {
    return item.id;
  }
}
