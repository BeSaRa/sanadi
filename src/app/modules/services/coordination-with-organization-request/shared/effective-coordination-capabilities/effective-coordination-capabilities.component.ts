import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, UntypedFormControl} from '@angular/forms';
import {UserClickOn} from '@enums/user-click-on.enum';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {EffectiveCoordinationCapabilities} from '@models/effective-coordination-capabilities';
import {Lookup} from '@models/lookup';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {Profile} from '@models/profile';
import { EffectiveCoordinationCapabilitiesPopupComponent } from '../../popups/effective-coordination-capabilities-popup/effective-coordination-capabilities-popup.component';

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
    private lookup: LookupService
  ) {
  }

  formArrayName: string = 'effectiveCoordinationCapabilities';
  @Input() orgId!: number | undefined;

  allowListUpdate: boolean = true;

  private _list: EffectiveCoordinationCapabilities[] = [];
  @Input() set list(list: EffectiveCoordinationCapabilities[]) {
    if (this.allowListUpdate) {
      this._list = list;
      this.listDataSource.next(this._list);
    }
  }

  model: EffectiveCoordinationCapabilities = new EffectiveCoordinationCapabilities();

  get list(): EffectiveCoordinationCapabilities[] {
    return this._list;
  }

  @Input() readonly: boolean = false;
  @Input() pageTitleKey: keyof ILanguageKeys = 'effective_coordination_capabilities';

  listDataSource: BehaviorSubject<EffectiveCoordinationCapabilities[]> = new BehaviorSubject<EffectiveCoordinationCapabilities[]>([]);
  columns = this.model.DisplayedColumns;

  editIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<void> = new Subject<void>();
  formOpened = false;
  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<EffectiveCoordinationCapabilities | null> =
    new Subject<EffectiveCoordinationCapabilities | null>();
  private currentRecord?: EffectiveCoordinationCapabilities;

  private destroy$: Subject<void> = new Subject();

  form!: FormGroup;
  @Input() organizationWays: Lookup[] = [];
  @Input() organizationUnits: Profile[] = [];

  @Input() canUpdate: boolean = true;
  @Input() isClaimed: boolean = false;

  filterControl: UntypedFormControl = new UntypedFormControl('');

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
      this.recordChanged$.next(new EffectiveCoordinationCapabilities());
    });
  }

  private listenToRecordChange() {
    this.recordChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((record) => {
        if (record && this.orgId) {
          record.organizationId = this.orgId;
        }
        this.currentRecord = record || undefined;
        if(this.currentRecord) {
          this.openFormDialog();
        }
      });
  }

  _getFormPopup() {
    return EffectiveCoordinationCapabilitiesPopupComponent;
  }
  openFormDialog() {
    this.dialogService.show(this._getFormPopup(), {
      form: this.form,
      editIndex: this.editIndex,
      model: this.currentRecord,
      readonly: this.readonly,
      viewOnly: this.viewOnly,
      organizationWays: this.organizationWays,
      organizationUnits: this.organizationUnits,
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
          const model = new EffectiveCoordinationCapabilities().clone({
            ...this.currentRecord,
            ...form.getRawValue(),
          });
          model.organizationWayInfo =
            this.lookup.listByCategory.OrganizationWay.find(x => x.lookupKey === model.organizationWay)!.convertToAdminResult();
          this.formOpened = false;
          return model;
        })
      )
      .subscribe((model: EffectiveCoordinationCapabilities) => {
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

  view($event: MouseEvent, record: EffectiveCoordinationCapabilities, index: number) {
    $event.preventDefault();
    this.formOpened = true;
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
    this.formOpened = true;
    this.editIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }
}
