import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {ToastService} from "@app/services/toast.service";
import {DialogService} from "@app/services/dialog.service";
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {ReadinessStatus} from "@app/types/types";
import {BehaviorSubject, Subject} from "rxjs";
import {filter, map, take, takeUntil} from "rxjs/operators";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {ContactOfficer} from "@app/models/contact-officer";

@Component({
  selector: 'contact-officer',
  templateUrl: './contact-officer.component.html',
  styleUrls: ['./contact-officer.component.scss']
})
export class ContactOfficerComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fb: UntypedFormBuilder) {
  }

  private _list: ContactOfficer[] = [];
  @Input() set list(list: ContactOfficer[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): ContactOfficer[] {
    return this._list;
  }

  @Input() readonly : boolean = false;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<ContactOfficer[]> = new BehaviorSubject<ContactOfficer[]>([]);
  columns = ['arabicName', 'englishName', 'email', 'phone', 'mobileNo', 'actions'];

  editIndex: number = -1;
  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<ContactOfficer | null> = new Subject<ContactOfficer | null>();
  private current?: ContactOfficer;
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
      contactOfficers: this.fb.array([])
    })
  }

  get contactOfficersFormArray(): UntypedFormArray {
    return (this.form.get('contactOfficers')) as UntypedFormArray;
  }

  addAllowed(): boolean {
    return !this.readonly;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.changed$.next(new ContactOfficer())
      })
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$))
      .subscribe(contact => {
        if (this.readonly) {
          return;
        }
        this.current = contact || undefined;
        this.updateForm(this.current);
      })
  }

  private updateForm(record: ContactOfficer | undefined) {
    const contactOfficersFormArray = this.contactOfficersFormArray;
    contactOfficersFormArray.clear();

    if (record) {
      this._setComponentReadiness('NOT_READY');
      contactOfficersFormArray.push(this.fb.group((record.getContactOfficerFields(true))));
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
      return this.form.get('contactOfficers.0') as AbstractControl;
    }));

    const validForm$ = form$.pipe(filter((form) => form.valid));
    const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.form.get('contactOfficers')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('contactOfficers.0')) as UntypedFormArray;
      }),
      map((form) => {
        return (new ContactOfficer()).clone({
          ...this.current, ...form.getRawValue()
        });
      })
    ).subscribe((contactOfficer: ContactOfficer) => {
      if (!contactOfficer) {
        return;
      }

      this._updateList(contactOfficer, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.changed$.next(null);
    });
  }

  private _updateList(record: (ContactOfficer | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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

  edit($event: MouseEvent, record: ContactOfficer, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.changed$.next(record);
  }

  delete($event: MouseEvent, record: ContactOfficer, index: number): any {
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
    this.contactOfficersFormArray.clear();
    this.contactOfficersFormArray.markAsUntouched();
    this.contactOfficersFormArray.markAsPristine();
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
