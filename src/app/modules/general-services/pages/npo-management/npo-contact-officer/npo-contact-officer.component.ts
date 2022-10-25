import { JobTitle } from './../../../../../models/job-title';
import { JobTitleService } from '@services/job-title.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LangService } from "@app/services/lang.service";
import { ToastService } from "@app/services/toast.service";
import { DialogService } from "@app/services/dialog.service";
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { ReadinessStatus } from "@app/types/types";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { UserClickOn } from "@app/enums/user-click-on.enum";
import { NpoContactOfficer } from "@app/models/npo-contact-officer";

@Component({
  selector: 'npo-contact-officer',
  templateUrl: './npo-contact-officer.component.html',
  styleUrls: ['./npo-contact-officer.component.scss']
})
export class NpoContactOfficerComponent implements OnInit, OnDestroy {
  jobTitleAdminLookup: JobTitle[] = [];
  constructor(public lang: LangService,
    private toastService: ToastService,
    private _jb: JobTitleService,
    private dialogService: DialogService,
    private fb: UntypedFormBuilder) {
  }

  private _list: NpoContactOfficer[] = [];
  @Input() set list(list: NpoContactOfficer[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): NpoContactOfficer[] {
    return this._list;
  }

  @Input() readonly: boolean = false;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<NpoContactOfficer[]> = new BehaviorSubject<NpoContactOfficer[]>([]);
  columns = ['idNumber', 'fullName', 'email', 'phone', 'extraPhone', 'actions'];

  viewOnly: boolean = false;
  editIndex: number = -1;
  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<NpoContactOfficer | null> = new Subject<NpoContactOfficer | null>();
  private current?: NpoContactOfficer;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;

  ngOnInit(): void {
    this._jb.loadAsLookups().subscribe((data) => {
      this.jobTitleAdminLookup = data;
    })
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
        this.viewOnly = false;
        this.changed$.next(new NpoContactOfficer())
      })
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$))
      .subscribe(contact => {

        this.current = contact || undefined;
        this.updateForm(this.current);
      })
  }

  private updateForm(record: NpoContactOfficer | undefined) {
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
      filter((form) => {
        const valid = this._list.findIndex(c => c.identificationNumber == form.value.identificationNumber) == -1;
        !valid && this.editIndex == -1 && this.dialogService
          .error(this.lang.map.msg_user_identifier_is_already_exist)
          .onAfterClose$
          .pipe(take(1))
          .subscribe(() => {
            this.form.get('contactOfficers')?.markAllAsTouched();
          });
        return valid || this.editIndex != -1
      }),
      map(() => {
        return (this.form.get('contactOfficers.0')) as UntypedFormArray;
      }),
      map((form) => {
        return (new NpoContactOfficer()).clone({
          ...this.current, ...form.getRawValue()
        });
      })
    ).subscribe((contactOfficer: NpoContactOfficer) => {
      if (!contactOfficer) {
        return;
      }

      this._updateList(contactOfficer, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.changed$.next(null);
    });
  }

  private _updateList(record: (NpoContactOfficer | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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

  edit($event: MouseEvent, record: NpoContactOfficer, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.changed$.next(record);
  }

  delete($event: MouseEvent, record: NpoContactOfficer, index: number): any {
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

  view($event: MouseEvent, record: NpoContactOfficer, index: number) {
    $event.preventDefault();
    this.editIndex = index;
    this.changed$.next(record);
  }
  forceClearComponent() {
    this.cancel();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }
}
