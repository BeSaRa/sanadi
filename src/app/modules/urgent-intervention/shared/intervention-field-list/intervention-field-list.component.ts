import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ReadinessStatus} from '@app/types/types';
import {InterventionField} from '@app/models/intervention-field';
import {Observable, of, Subject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {filter, map, take, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {ImplementingAgency} from '@app/models/implementing-agency';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {LookupService} from '@services/lookup.service';
import {DacOcha} from '@app/models/dac-ocha';
import {DacOchaService} from '@services/dac-ocha.service';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'intervention-field-list',
  templateUrl: './intervention-field-list.component.html',
  styleUrls: ['./intervention-field-list.component.scss']
})
export class InterventionFieldListComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private lookupService: LookupService,
              private dacOchaService: DacOchaService,
              private fb: FormBuilder) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  @Input() readonly: boolean = false;

  private _list: InterventionField[] = [];
  @Input() set list(list: InterventionField[]) {
    this._list = list;
  }

  get list(): InterventionField[] {
    return this._list;
  }

  columns = ['mainOcha', 'subOcha', 'actions'];
  editItem?: InterventionField;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<InterventionField | null> = new Subject<InterventionField | null>();
  private currentRecord?: InterventionField;
  private destroy$: Subject<any> = new Subject<any>();
  showForm: boolean = false;
  filterControl: FormControl = new FormControl('');

  form!: FormGroup;
  actions: IMenuItem<InterventionField>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: InterventionField) => this.edit(item),
      show: (item: InterventionField) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: InterventionField) => this.delete(item),
      show: (item: InterventionField) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: InterventionField) => this.view(item),
      show: (item: InterventionField) => this.readonly
    }
  ];
  sortingCallbacks = {
    mainOCha: (a: InterventionField, b: InterventionField, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.mainUNOCHACategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.mainUNOCHACategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    subOcha: (a: InterventionField, b: InterventionField, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.subUNOCHACategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.subUNOCHACategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  mainOchaCategories: DacOcha[] = [];
  subOchaCategories: DacOcha[] = [];

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
    this.loadMainOchaList();
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

  private loadMainOchaList(): void {
    this.dacOchaService.loadOCHAs()
      .pipe(
        takeUntil(this.destroy$),
        map((result: DacOcha[]) => {
          return result.filter(x => !x.parentId);
        })
      ).subscribe((list) => {
      this.mainOchaCategories = list
    });
  }

  handleChangeMainOcha(value: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this.loadSubOchaList(value);
    }
  }

  private loadSubOchaList(mainOchaId: number): void {
    if (!mainOchaId) {
      this.subOchaCategories = [];
      return;
    }
    this.dacOchaService
      .loadSubDacOchas(mainOchaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.subOchaCategories = list;
      });
  }


  buildForm(): void {
    this.form = this.fb.group(new InterventionField().getInterventionFieldForm(true));
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new InterventionField());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.showForm = !!this.currentRecord;
      this.updateForm(this.currentRecord);
    });
  }

  private updateForm(record: InterventionField | undefined) {
    if (record) {
      this.loadSubOchaList(record.mainUNOCHACategory);
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
        return (new InterventionField()).clone({
          ...this.currentRecord, ...formValue
        });
      })
    ).subscribe((agency: InterventionField) => {
      if (!agency) {
        return;
      }
      this._updateList(agency, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  private _updateList(record: (InterventionField | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else {
        let index = !this.editItem ? -1 : this.list.findIndex(x => x === this.editItem);
        if (operation === 'UPDATE') {
          this.list.splice(index, 1, record);
        } else if (operation === 'DELETE') {
          this.list.splice(index, 1);
        }
      }
    }
    this.list = this.list.slice();
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
    this._setComponentReadiness('READY');
  }

  edit(record: InterventionField, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: InterventionField, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: InterventionField, $event?: MouseEvent): any {
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

}
