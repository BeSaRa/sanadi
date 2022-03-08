import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CollectionApproval} from "@app/models/collection-approval";
import {BehaviorSubject, of, Subject} from "rxjs";
import {filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {CollectionItem} from "@app/models/collection-item";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {LangService} from "@app/services/lang.service";
import {AppEvents} from "@app/enums/app-events";
import {DialogService} from '@app/services/dialog.service';
import {UserClickOn} from "@app/enums/user-click-on.enum";

@Component({
  selector: 'collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.scss']
})
export class CollectionItemComponent implements OnInit, OnDestroy {

  constructor(private fb: FormBuilder,
              public lang: LangService,
              private dialog: DialogService) {
  }

  @Input()
  model!: CollectionApproval
  destroy$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<{ item: CollectionItem, index: number }> = new Subject<{ item: CollectionItem, index: number }>();
  remove$: Subject<{ item: CollectionItem, index: number }> = new Subject<{ item: CollectionItem; index: number }>();
  save$: Subject<null> = new Subject<null>();

  editIndex: number | undefined = undefined;

  item?: CollectionItem;

  form!: FormGroup;

  searchControl: FormControl = new FormControl();

  @Output()
  approval: EventEmitter<{ item: CollectionItem, index: number }> = new EventEmitter<{ item: CollectionItem; index: number }>();

  @Output()
  eventHappened: EventEmitter<AppEvents> = new EventEmitter<AppEvents>();
  @Output()
  formOpenedStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  columns: string[] = ['identificationNumber', 'zoneNumber', 'streetNumber', 'buildingNumber', 'unitNumber', 'map', 'actions'];
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

  ngOnInit(): void {
    if (!this.model) {
      throw Error('Please Provide Model to get the Collection Items from it')
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(_ => this.item = new CollectionItem().clone({
        licenseDurationType: this.model.licenseDurationType
      })))
      .pipe(tap(_ => console.log(this.model)))
      .subscribe(() => this.formOpenedStatus.emit(true))
  }

  private listenToEdit() {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(info => {
        // always add one here to the selected index to avoid the if condition while process save
        this.editIndex = (info.index++)
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

  private buildForm(): void {
    this.form = this.fb.group((new CollectionItem().buildForm(true)));
  }

  private updateForm(model: CollectionItem): void {
    this.form.patchValue(model.buildForm(false));
  }

  private resetForm(): void {
    this.form.reset();
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
        this.processSave(new CollectionItem().clone({
          ...this.item,
          ...this.form.value
        }))
      })
  }

  private processSave(item: CollectionItem): void {
    this.editIndex ? this.processEdit(item) : this.processAdd(item);
    this.cancel();
  }

  private processAdd(item: CollectionItem): void {
    this.model.collectionItemList = this.model.collectionItemList.concat([item]);
    this.eventHappened.emit(AppEvents.ADD)
  }

  private processEdit(item: CollectionItem): void {
    this.model.collectionItemList.splice((this.editIndex!) - 1, 1, item);
    this.model.collectionItemList = [...this.model.collectionItemList];
    this.eventHappened.emit(AppEvents.EDIT)
  }

  private processDelete(index: number): void {
    this.model.collectionItemList.splice(index, 1)
    this.model.collectionItemList = [...this.model.collectionItemList];
    this.eventHappened.emit(AppEvents.DELETE);
  }

  private formInvalidMessage(): void {
    console.log('FORM INVALID', this.form.invalid);
  }

  openLocationMap(_item: CollectionItem) {
    // open the map for the current selected collection item
  }

  searchForLicense() {
    console.log('SEARCH');
  }

  cancel(): void {
    this.item = undefined;
    this.editIndex = undefined;
    this.resetForm();
    this.formOpenedStatus.emit(false);
  }
}
