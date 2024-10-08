import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormControl,
} from '@angular/forms';
import { UserClickOn } from '@enums/user-click-on.enum';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { Lookup } from '@models/lookup';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { LookupService } from '@services/lookup.service';
import { ToastService } from '@services/toast.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { BuildingAbility } from '@models/building-ability';
import { Profile } from '@models/profile';
import { BuildingAbilityPopupComponent } from '../../popups/building-ability-popup/building-ability-popup.component';
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {ActionIconsEnum} from "@enums/action-icons-enum";

@Component({
  selector: 'building-ability',
  templateUrl: './building-ability.component.html',
  styleUrls: ['./building-ability.component.scss'],
})
export class BuildingAbilityComponent implements OnInit {
  constructor(public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private lookup: LookupService) {
  }

  @Input() formArrayName: string = 'buildingAbilitiesList';
  @Input() orgId!: number | undefined;
  allowListUpdate: boolean = true;

  private _list: BuildingAbility[] = [];
  @Input() set list(list: BuildingAbility[]) {
    if (this.allowListUpdate) {
      this._list = list;
      this.listDataSource.next(this._list);
    }
  }

  model: BuildingAbility = new BuildingAbility();

  get list(): BuildingAbility[] {
    return this._list;
  }

  @Input() readonly: boolean = false;
  @Input() pageTitleKey: keyof ILanguageKeys = 'building_abilities';

  listDataSource: BehaviorSubject<BuildingAbility[]> = new BehaviorSubject<BuildingAbility[]>([]);
  columns = this.model.DisplayedColumns;

  editIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<void> = new Subject<void>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<BuildingAbility | null> =
    new Subject<BuildingAbility | null>();
  private currentRecord?: BuildingAbility;

  private destroy$: Subject<void> = new Subject();
  formOpened = false;
  form!: FormGroup;
  @Input() organizationUnits: Profile[] = [];
  @Input() trainingTypes: Lookup[] = [];
  @Input() trainingLanguages: Lookup[] = [];
  @Input() trainingWays: Lookup[] = [];
  @Input() recommendedWays: Lookup[] = [];
  @Input() canUpdate: boolean = true;
  @Input() isClaimed: boolean = true;

  filterControl: UntypedFormControl = new UntypedFormControl('');
  actions: IMenuItem<BuildingAbility>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      show: () => !this.readonly && this.canUpdate && this.isClaimed,
      onClick: (item, itemIndex: number) => this.edit(item, itemIndex)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      show: () => !this.readonly && this.canUpdate && this.isClaimed,
      onClick: (item, itemIndex: number) => this.delete(item, itemIndex)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item, itemIndex: number) => this.view(item, itemIndex)
    },
  ];

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
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
      this.formOpened = true;
      this.recordChanged$.next(new BuildingAbility());
    });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      if (record && this.orgId) {
        record.organizationId = this.orgId;
      }
      this.currentRecord = record || undefined;
      if (this.currentRecord) {
        this.openFormDialog();
      }
    });
  }
  _getFormPopup() {
    return BuildingAbilityPopupComponent;
  }
  openFormDialog() {
    this.dialogService.show(this._getFormPopup(), {
      form: this.form,
      editIndex: this.editIndex,
      model: this.currentRecord,
      readonly: this.readonly,
      viewOnly: this.viewOnly,
      recommendedWays: this.recommendedWays,
      organizationUnits: this.organizationUnits,
      trainingTypes: this.trainingTypes,
      trainingLanguages: this.trainingLanguages,
      trainingWays: this.trainingWays,
      formArrayName: this.formArrayName
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.onSave();
      } else {
        this.onCancel();
      }
    })
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
          this.openFormDialog();
        });
    });

    validForm$
      .pipe(
        takeUntil(this.destroy$),
        map(() => {
          return this.form.get(`${this.formArrayName}.0`) as FormArray;
        }),
        map((form) => {
          const model = new BuildingAbility().clone({
            ...this.currentRecord,
            ...form.getRawValue(),
          });
          this._updateLookups(model);
          this.formOpened = false;
          return model;
        })
      )
      .subscribe((model: BuildingAbility) => {
        if (!model) {
          return;
        }
        this._updateList(
          model,
          this.editIndex > -1 ? 'UPDATE' : 'ADD',
          this.editIndex
        );
        this.toastService.success(this.lang.map.msg_save_success);
        this.editIndex = -1;
        this.viewOnly = false;
        this.recordChanged$.next(null);
      });
  }

  private _updateLookups(model: BuildingAbility) {
    model.trainingActivityTypeInfo =
      this.lookup.listByCategory.TrainingActivityType.find(
        (x) => x.lookupKey === model.trainingActivityType
      )!.convertToAdminResult();
    model.trainingLanguageInfo =
      this.lookup.listByCategory.TrainingLanguage.find(
        (x) => x.lookupKey === model.trainingLanguage
      )!.convertToAdminResult();
    model.trainingWayInfo = this.lookup.listByCategory.TrainingWay.find(
      (x) => x.lookupKey === model.trainingWay
    )!.convertToAdminResult();
  }

  private _updateList(
    record: BuildingAbility | null,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE',
    gridIndex: number = -1
  ) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else if (operation === 'UPDATE') {
        this.list.splice(gridIndex, 1, record);
      } else if (operation === 'DELETE') {
        this.list.splice(gridIndex, 1);
      }
    }
    this.listDataSource.next(this.list);
  }

  addAllowed(): boolean {
    return !this.readonly && !this.formOpened;
  }

  onSave() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }

  onCancel() {
    this.resetForm();
    this.editIndex = -1;
  }

  private resetForm() {
    this.formOpened = false;
  }

  view(record: BuildingAbility, index: number, $event?: MouseEvent) {
    $event?.preventDefault();
    this.formOpened = true;
    this.editIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: BuildingAbility, index: number, $event?: MouseEvent): any {
    $event?.preventDefault();
    if (this.readonly || !this.canUpdate || !this.isClaimed) {
      return;
    }
    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: record.activityName}))
      .onAfterClose$.pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._updateList(record, 'DELETE', index);
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }

  edit(record: BuildingAbility, index: number, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly || !this.canUpdate || !this.isClaimed) {
      return;
    }
    this.editIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }
}
