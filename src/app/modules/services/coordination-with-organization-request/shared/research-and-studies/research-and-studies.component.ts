import {
  Component, Input,
  OnInit
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup, UntypedFormArray, UntypedFormControl, UntypedFormGroup
} from '@angular/forms';
import { UserClickOn } from '@enums/user-click-on.enum';
import { DateUtils } from '@helpers/date-utils';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { ResearchAndStudies } from '@models/research-and-studies';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { DatepickerOptionsMap } from '@app/types/types';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-research-and-studies',
  templateUrl: './research-and-studies.component.html',
  styleUrls: ['./research-and-studies.component.scss'],
})
export class ResearchAndStudiesComponent implements OnInit {
  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: FormBuilder
  ) {}
  @Input() formArrayName: string = 'researchAndStudies';
  @Input() orgId!:number|undefined;

  allowListUpdate:boolean=true;
  private _list: ResearchAndStudies[] = [];
  @Input() set list(list: ResearchAndStudies[]) {
    if( this.allowListUpdate === true){
      this._list = list;
      this.listDataSource.next(this._list);
    }
  }
  model: ResearchAndStudies = new ResearchAndStudies();
  get list(): ResearchAndStudies[] {
    return this._list;
  }
  @Input() readonly: boolean = false;
  @Input() pageTitleKey: keyof ILanguageKeys = 'research_and_studies';
  @Input() canUpdate:boolean=true;
  @Input() isClaimed:boolean=false;

  listDataSource: BehaviorSubject<ResearchAndStudies[]> = new BehaviorSubject<
    ResearchAndStudies[]
  >([]);
  columns = this.model.DisplayedColumns;

  editIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<ResearchAndStudies | null> =
    new Subject<ResearchAndStudies | null>();
  private currentRecord?: ResearchAndStudies;

  private destroy$: Subject<any> = new Subject<any>();
  formOpend=false;
  form!: FormGroup;

  datepickerOptionsMap: DatepickerOptionsMap = {
    searchStartDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
    searchSubmissionDeadline: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
  };

  get formArray(): FormArray {
    return this.form.get(this.formArrayName) as FormArray;
  }
  filterControl: UntypedFormControl = new UntypedFormControl('');
  showForm: boolean = false;
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
      this.formOpend=true;
      this.recordChanged$.next(new ResearchAndStudies());
    });
  }
  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      if(record && this.orgId)record.organizationId=this.orgId;
      this.currentRecord = record || undefined;
      this.showForm = !!this.currentRecord;
      this.updateForm(this.currentRecord);
    });
  }
  private updateForm(model: ResearchAndStudies | undefined) {
    const formArray = this.formArray;
    formArray.clear();
    if (model) {

      formArray.push(this.fb.group(new ResearchAndStudies().clone(model).BuildForm(true)));
      if (this.readonly || this.viewOnly) {
        this.formArray.disable();
      }
    }
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
        });
    });

    validForm$
      .pipe(
        takeUntil(this.destroy$),
        map(() => {
          return this.form.get(`${this.formArrayName}.0`) as FormArray;
        }),
        map((form) => {
          const model= new ResearchAndStudies().clone({
            ...this.currentRecord,
            ...form.getRawValue(),
          });
          this.formOpend=false;
          return model;
        })
      )
      .subscribe((model: ResearchAndStudies) => {
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
  private _updateList(
    record: ResearchAndStudies | null,
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
    return !this.readonly && !this.showForm;
  }
  onSave() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }
  onCancel() {
    this.resetForm();
    this.showForm=false;
    this.editIndex = -1;
  }
  private resetForm() {
    this.formOpend=false;
    this.formArray.clear();
    this.formArray.markAsUntouched();
    this.formArray.markAsPristine();
  }
  view($event: MouseEvent, record: ResearchAndStudies, index: number) {
    $event.preventDefault();
    this.formOpend=true;
    this.editIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete($event: MouseEvent, record: ResearchAndStudies, index: number): any {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
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
  edit($event: MouseEvent, record: ResearchAndStudies, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.formOpend=true;
    this.editIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }
  get researchAndStudiesForm() {
    return this.form.controls.researchAndStudies as UntypedFormArray;
  }
  get researchAndStudiesFormArray() {
    return this.researchAndStudiesForm.controls['0'] as UntypedFormGroup;
  }
  get searchStartDate() {
    return this.researchAndStudiesFormArray.controls
      .searchStartDate as UntypedFormControl;
  }
  get searchSubmissionDeadline() {
    return this.researchAndStudiesFormArray.controls
      .searchSubmissionDeadline as UntypedFormControl;
  }
  onDateChange(
    event: IMyInputFieldChanged,
    fromFieldName: string,
    toFieldName: string
  ): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        searchStartDate: this.searchStartDate,
        searchSubmissionDeadline: this.searchSubmissionDeadline,
      },
    });
  }
}
