import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {AppEvents} from '@app/enums/app-events';
import {CollectorApproval} from '@app/models/collector-approval';
import {CollectorItem} from '@app/models/collector-item';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DateUtils} from '@app/helpers/date-utils';

@Component({
  selector: 'collector-item',
  templateUrl: './collector-item.component.html',
  styleUrls: ['./collector-item.component.scss']
})
export class CollectorItemComponent implements OnInit, OnDestroy {
  @Input()
  model!: CollectorApproval
  destroy$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<{ item: CollectorItem, index: number }> = new Subject<{ item: CollectorItem, index: number }>();
  remove$: Subject<{ item: CollectorItem, index: number }> = new Subject<{ item: CollectorItem; index: number }>();
  save$: Subject<null> = new Subject<null>();
  editIndex: number | undefined = undefined;
  item?: CollectorItem;
  form!: FormGroup;
  searchControl: FormControl = new FormControl();
  collectorTypes: Lookup[] = this.lookupService.listByCategory.CollectorType;
  collectorRelations: Lookup[] = this.lookupService.listByCategory.CollectorRelation;
  genders: Lookup[] = this.lookupService.listByCategory.Gender;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  relationships: Lookup[] = this.lookupService.listByCategory.CollectorRelation;

  datepickerOptionsMap: IKeyValue = {
    licenseEndDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  @Output()
  approval: EventEmitter<{ item: CollectorItem, index: number }> = new EventEmitter<{ item: CollectorItem; index: number }>();

  @Output()
  eventHappened: EventEmitter<AppEvents> = new EventEmitter<AppEvents>();
  @Output()
  formOpenedStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  columns: string[] = ['identificationNumber', 'arabicName', 'collectorType', 'jobTitle', 'actions'];
  @Input()
  approvalMode: boolean = false;

  @Input()
  disableAdd: boolean = false;

  private _disableSearch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  @Input()
  set disableSearch(val: boolean) {
    this._disableSearch.next(val);
  }

  get disableSearch(): boolean {
    return this._disableSearch.value;
  }

  constructor(private fb: FormBuilder,
              public lang: LangService,
              private dialog: DialogService,
              private lookupService: LookupService) {
  }

  ngOnInit(): void {
    if (!this.model) {
      throw Error('Please Provide Model to get the Collector Items from it')
    }

    if (this.approvalMode) {
      const newColumns = this.columns.slice()
      newColumns.splice(this.columns.length - 1, 0, 'approval_info_status');
      this.columns = newColumns;
    }
    this.buildForm();
    this.listenToAdd();
    this.listenToEdit();
    this.listenToRemove();
    this.listenToSave();
    this.listenToDisableSearchField()
  }

  private buildForm(): void {
    this.form = this.fb.group((new CollectorItem().buildForm(true)));
  }

  private updateForm(model: CollectorItem): void {
    this.form.patchValue(model.buildForm(false));
  }

  private resetForm(): void {
    this.form.reset();
  }

  private listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(_ => this.item = new CollectorItem().clone<CollectorItem>({
        licenseDurationType: this.model.licenseDurationType
      })))
      .subscribe(() => this.formOpenedStatus.emit(true))
  }

  private listenToEdit() {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(info => {
        // always add one here to the selected index to avoid the if condition while process save
        this.editIndex = (++info.index);
        this.item = info.item;
        this.updateForm(this.item);
      }))
      .subscribe(() => this.formOpenedStatus.emit(true))
  }

  private listenToRemove() {
    this.remove$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(info => {
        return this.dialog
          .confirm(this.lang.map.msg_confirm_delete_x.change({x: info.item.identificationNumber}))
          .onAfterClose$.pipe(map((click: UserClickOn) => {
            return {
              index: info.index,
              click
            }
          }))
      }))
      .subscribe((info) => {
        info.click === UserClickOn.YES ? this.processDelete(info.index) : null;
      })
  }

  private listenToDisableSearchField() {
    this._disableSearch
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        value ? this.searchControl.disable() : this.searchControl.enable();
      })
  }

  private listenToSave(): void {
    this.save$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(() => of(this.form.valid)))
      .pipe(tap(valid => !valid && this.formInvalidMessage()))
      .pipe(filter(valid => valid))
      .subscribe(() => {
        this.processSave(new CollectorItem().clone<CollectorItem>({
          ...this.item,
          ...this.form.value
        }))
      })
  }

  private processSave(item: CollectorItem): void {
    this.editIndex ? this.processEdit(item) : this.processAdd(item);
    this.cancel();
  }

  private processAdd(item: CollectorItem): void {
    this.model.collectorItemList = this.model.collectorItemList.concat([item]);
    this.eventHappened.emit(AppEvents.ADD)
  }

  private processEdit(item: CollectorItem): void {
    this.model.collectorItemList.splice((this.editIndex!) - 1, 1, item);
    this.model.collectorItemList = [...this.model.collectorItemList];
    this.eventHappened.emit(AppEvents.EDIT)
  }

  private processDelete(index: number): void {
    this.model.collectorItemList.splice(index, 1)
    this.model.collectorItemList = [...this.model.collectorItemList];
    this.eventHappened.emit(AppEvents.DELETE);
  }

  private formInvalidMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
    this.form.markAllAsTouched();
  }

  cancel(): void {
    this.item = undefined;
    this.editIndex = undefined;
    this.resetForm();
    this.formOpenedStatus.emit(false);
  }

  searchForLicense() {
    console.log('SEARCH');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
