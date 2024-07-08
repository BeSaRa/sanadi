import { ITerminateOrganizationTask } from '@contracts/iterminate-organization-task';
import { AdminResult } from '@models/admin-result';
import { map, take, takeUntil } from 'rxjs/operators';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormControl,
} from '@angular/forms';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserClickOn } from '@enums/user-click-on.enum';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ParticipantOrg } from '@models/participant-org';
import { Profile } from '@models/profile';
import { TaskAdminResult } from '@models/task-admin-result';
import { AvailableLanguagesNames } from '@app/enums/available-languages-names-enum';

@Component({
  selector: 'participant-organization',
  templateUrl: './participant-organization.component.html',
  styleUrls: ['./participant-organization.component.scss'],
})
export class ParticipantOrganizationComponent implements OnInit {
  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: FormBuilder
  ) {}

  @Input() formArrayName: string = 'participatingOrganizaionList';

  get formArray(): FormArray {
    return this.form.get(this.formArrayName) as FormArray;
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  @Output() listUpdated = new EventEmitter();
  private _list: ParticipantOrg[] = [];
  @Input() set list(list: ParticipantOrg[]) {
    this._list = list;
    this.listDataSource.next(this._list);
  }

  get list(): ParticipantOrg[] {
    return this._list;
  }

  @Input() isSuperVisor: boolean = false;
  model: ParticipantOrg = new ParticipantOrg();
  @Input() pageTitleKey: keyof ILanguageKeys = 'participant_organizations';

  listDataSource: BehaviorSubject<ParticipantOrg[]> = new BehaviorSubject<
    ParticipantOrg[]
  >([]);
  columns = this.model.DisplayedColumns;

  @Input() canAdd: boolean = true;
  @Input() canView: boolean = true;
  @Input() canDelete: boolean = true;
  @Input() canTerminate: boolean = true;
  @Input() locations:TaskAdminResult[] = [];

  private readonly: boolean = true;
  private save$: Subject<void> = new Subject<void>();

  private recordChanged$: Subject<Profile | null> =
    new Subject<Profile | null>();
  private currentRecord?: ParticipantOrg;

  private destroy$: Subject<void> = new Subject();

  form!: FormGroup;
  @Input() organizationUnits: Profile[] = [];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  showForm: boolean = false;
  ngOnInit(): void {
    this.buildForm();
    this.listenToRecordChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
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

  listenToRecordChange() {
    this.recordChanged$
      .pipe(
        takeUntil(this.destroy$),
        map((org) => {
          return org
            ? new ParticipantOrg().clone({
                organizationId: org?.id,
                arabicName: org?.arName,
                englishName: org?.enName,
              })
            : org;
        })
      )
      .subscribe((record) => {
        this.currentRecord = record || undefined;
        this.updateForm(this.currentRecord);
        this.readonly = record === undefined;
      });
  }

  private updateForm(model: ParticipantOrg | undefined) {
    const formArray = this.formArray;
    formArray.clear();
    if (model) {
      formArray.push(this.fb.group(model.BuildForm(true)));
    } else {
      this._setComponentReadiness('READY');
    }
  }

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  @ViewChild('selectOrganizations')
  ngSelectComponentRef!: NgSelectComponent;

  onChangeRecord(id: number) {
    const record = this.organizationUnits.find(
      (org: Profile) => org.id === id
    )!;
    this.recordChanged$.next(record);
  }

  onSave() {
    this.save$.next();
  }

  allowAdd() {
    return this.readonly;
  }

  private listenToSave() {
    this.save$
      .pipe(
        map(() => {
          return this.form.get(`${this.formArrayName}.0`) as AbstractControl;
        }),
        takeUntil(this.destroy$),
        map(() => {
          return this.form.get(`${this.formArrayName}.0`) as FormArray;
        }),
        map((form) => {
          return new ParticipantOrg().clone({
            ...this.currentRecord,
            ...form.getRawValue(),
          });
        })
      )
      .subscribe((model: ParticipantOrg) => {
        if (!model) {
          return;
        }
        this._updateList(model, 'ADD');
        this.toastService.success(this.lang.map.msg_save_success);
      });
  }

  private _updateList(
    record: ParticipantOrg | null,
    operation: 'ADD' | 'DELETE' | 'NONE',
    gridIndex: number = -1
  ) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
        this.organizationUnits = this.organizationUnits.filter(
          (org: Profile) => org.id !== record.organizationId
        );
      } else if (operation === 'DELETE') {
        this.list.splice(gridIndex, 1);
        const org = new Profile().clone({
          id: record.organizationId,
          enName: record.englishName,
          arName: record.arabicName,
        });
        this.organizationUnits.push(org);
      }
    }

    this.list = this.list.slice();
    this.listDataSource.next(this.list);
    this.ngSelectComponentRef.handleClearClick();
    this.sortOrganizations();
    this.listUpdated.emit();
  }

  delete($event: MouseEvent, record: ParticipantOrg, index: number): any {
    $event.preventDefault();

    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$.pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._updateList(record, 'DELETE', index);

          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }

  @Output() requestView: EventEmitter<number> = new EventEmitter<number>();

  view($event: MouseEvent, record: ParticipantOrg): any {
    $event.preventDefault();
    this.requestView.emit(record.organizationId);
  }

  @Output() requestTerminate: EventEmitter<ITerminateOrganizationTask> = new EventEmitter<ITerminateOrganizationTask>();
  terminate($event: MouseEvent, record: ParticipantOrg) {
    $event.preventDefault();
    const {tkiid}= this.locations.find(location=>location.organizationId === record.organizationId)!;
    this.requestTerminate.emit({
      organizationId:record.organizationId,
      taskId: tkiid!
    });
  }

  isTerminated(record: ParticipantOrg){
    return !this.locations.find(location=>location.organizationId === record.organizationId);
  }
  sortOrganizations() {
    const propName =
      this.lang.getCurrentLanguage().code === AvailableLanguagesNames.ENGLISH ? 'enName' : 'arName';
    this.organizationUnits.sort((a, b) => (a[propName] < b[propName] ? -1 : 1));
  }

  calculateTotalParticipatingValue() {
    return this.list
      .map((x) => Number(x.value ?? 0))
      .reduce((a, b) => a + b, 0);
  }
}
