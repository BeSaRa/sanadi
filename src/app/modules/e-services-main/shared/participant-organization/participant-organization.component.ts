import { map, takeUntil, take } from 'rxjs/operators';
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
} from '@angular/forms';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { OrgUnit } from '@app/models/org-unit';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ParticipantOrg } from '@app/models/participant-org';

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
  ) {

  }

  @Input() formArrayName: string = 'participatingOrganizaionList';
  get formArray(): FormArray {
    return this.form.get(this.formArrayName) as FormArray;
  }
  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  @Output() listUpdated= new EventEmitter();
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

  @Input()canUpdate:boolean=true;
  @Input()isClaimed:boolean=false;
  private readonly: boolean = true;
  private save$: Subject<any> = new Subject<any>();

  private recordChanged$: Subject<OrgUnit | null> =
    new Subject<OrgUnit | null>();
  private currentRecord?: ParticipantOrg;

  private destroy$: Subject<any> = new Subject<any>();

  form!: FormGroup;
  @Input() organizationUnits: OrgUnit[] = [];

  ngOnInit(): void {
    this.buildForm();
    this.listenToRecordChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
    if(this.canUpdate === false){
      this.model.DisplayedColumns= this.model.DisplayedColumns.slice(0,this.model.DisplayedColumns.length-1);
    }
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
        map((orgUnit) =>
          orgUnit
            ? new ParticipantOrg().clone({
                organizationId: orgUnit?.id,
                arabicName: orgUnit?.arName,
                englishName: orgUnit?.enName,
              })
            : orgUnit
        )
      )
      .subscribe((record) => {
        this.currentRecord = record || undefined;
        this.updateForm(this.currentRecord);
        this.readonly = record === undefined ? true : false;
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
    const record = this.organizationUnits.find((orgUnit) => orgUnit.id === id)!;
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
          (orgUnit) => orgUnit.id !== record.organizationId
        );
      } else if (operation === 'DELETE') {
        this.list.splice(gridIndex,1);
        const orgUnit=new OrgUnit().clone({
          id: record.organizationId,
          enName: record.englishName,
          arName: record.arabicName,
        })
        this.organizationUnits.push(orgUnit)
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
  sortOrganizations() {
    const propName =
      this.lang.getCurrentLanguage().name === 'English' ? 'enName' : 'arName';
    this.organizationUnits.sort((a, b) => (a[propName] < b[propName] ? -1 : 1));
  }

}
