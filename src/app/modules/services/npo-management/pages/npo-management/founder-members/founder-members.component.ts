import {DateUtils} from '@helpers/date-utils';
import {DatepickerOptionsMap, ReadinessStatus} from '@app/types/types';
import {LookupService} from '@services/lookup.service';
import {Lookup} from '@models/lookup';
import {JobTitleService} from '@services/job-title.service';
import {JobTitle} from '@models/job-title';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {ToastService} from "@app/services/toast.service";
import {DialogService} from "@app/services/dialog.service";
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {BehaviorSubject, Subject} from "rxjs";
import {filter, map, take, takeUntil} from "rxjs/operators";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {FounderMembers} from "@app/models/founder-members";
import { FounderMembersPopupComponent } from '../../../popups/founder-members-popup/founder-members-popup.component';

@Component({
  selector: 'founder-members',
  templateUrl: './founder-members.component.html',
  styleUrls: ['./founder-members.component.scss']
})
export class FounderMembersComponent implements OnInit, OnDestroy {
  nationalityList: Lookup[] = this.lookupService.listByCategory.Nationality;
  jobTitleAdminLookup: JobTitle[] = [];
  constructor(public lang: LangService,
    private toastService: ToastService,
    private lookupService: LookupService,
    private dialogService: DialogService,
    private _jb: JobTitleService,
    private fb: UntypedFormBuilder) {
  }

  private _list: FounderMembers[] = [];
  @Input() set list(list: FounderMembers[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): FounderMembers[] {
    return this._list;
  }

  @Input() readonly: boolean = false;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<FounderMembers[]> = new BehaviorSubject<FounderMembers[]>([]);
  columns = ['idNumber', 'fullName', 'email', 'phone', 'extraPhone', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  editIndex: number = -1;
  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<FounderMembers | null> = new Subject<FounderMembers | null>();
  private current?: FounderMembers;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;

  datepickerOptionsMap: DatepickerOptionsMap = {
    joinDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
  }
  ngOnInit(): void {
    this._jb.loadActive().subscribe((data) => {
      this.jobTitleAdminLookup = data;
    })
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

  private buildForm() {
    this.form = this.fb.group({
      founderMembers: this.fb.array([])
    })
  }

  get founderMembersFormArray(): UntypedFormArray {
    return (this.form.get('founderMembers')) as UntypedFormArray;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.changed$.next(new FounderMembers())
      })
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$))
      .subscribe(member => {
        this.current = member || undefined;
        this.updateForm(this.current);
      })
  }

  _getPopupComponent() {
    return FounderMembersPopupComponent;
  }

  openFormPopup() {
    this.dialogService.show(this._getPopupComponent(), {
      form: this.form,
      readonly: this.readonly,
      editIndex: this.editIndex,
      model: this.current,
      founderMembersFormArray: this.founderMembersFormArray,
      nationalityList:this.nationalityList,
      jobTitleAdminLookup: this.jobTitleAdminLookup
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save()
      } else {
        this.cancel();
      }
    })
  }

  private updateForm(record: FounderMembers | undefined) {
    const founderMembersFormArray = this.founderMembersFormArray;
    founderMembersFormArray.clear();

    if (record) {
      this._setComponentReadiness('NOT_READY');
      founderMembersFormArray.push(this.fb.group((record.getFounderMembersFields(true))));
      this.openFormPopup()
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
    this.save$.pipe(map(() => {
      return this.form.get('founderMembers.0') as AbstractControl;
    })).pipe(
      takeUntil(this.destroy$),
      filter((form) => {
        const valid = this._list.findIndex(f => f.identificationNumber == form.value.identificationNumber) == -1;
        !valid && this.editIndex == -1 && this.dialogService
          .error(this.lang.map.msg_user_identifier_is_already_exist)
          .onAfterClose$
          .pipe(take(1))
          .subscribe(() => {
            this.form.get('founderMembers')?.markAllAsTouched();
            this.openFormPopup();
          });
        return valid || this.editIndex != -1
      }),
      map(() => {
        return (this.form.get('founderMembers.0')) as UntypedFormArray;
      }),
      map((form) => {
        return (new FounderMembers()).clone({
          ...this.current, ...form.getRawValue()
        });
      })
    ).subscribe((member: FounderMembers) => {
      if (!member) {
        return;
      }

      this._updateList(member, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.changed$.next(null);
    });
  }

  private _updateList(record: (FounderMembers | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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

  edit($event: MouseEvent, record: FounderMembers, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.changed$.next(record);
  }

  delete($event: MouseEvent, record: FounderMembers, index: number): any {
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
    this.founderMembersFormArray.clear();
    this.founderMembersFormArray.markAsUntouched();
    this.founderMembersFormArray.markAsPristine();
  }

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }
  view($event: MouseEvent, record: FounderMembers, index: number) {
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
  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }
}
