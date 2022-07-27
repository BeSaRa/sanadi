import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { CaseTypes } from '@app/enums/case-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { ProjectNeed, ProjectNeeds } from '@app/models/project-needs';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'project-needs',
  templateUrl: './project-needs.component.html',
  styleUrls: ['./project-needs.component.scss'],
})
export class ProjectNeedsComponent implements OnInit {
  private _list: ProjectNeeds = [];
  private currentRecord?: ProjectNeed;
  private save$: Subject<any> = new Subject<any>();

  totalCost: number = 0;
  form!: FormGroup;
  add$: Subject<any> = new Subject<any>();
  columns = [
    'projectName',
    'projectDescription',
    'beneficiaries',
    'goals',
    'totalCost',
    'actions',
  ];
  projectNeeds = new BehaviorSubject<ProjectNeeds>([]);
  editRecordIndex = -1;

  @Input() readonly = false;
  @Input() caseType?: CaseTypes;
  @Input() set list(list: ProjectNeeds) {
    this._list = list;
    this.totalCost = list.reduce((p, c) => p + +c.totalCost, 0);
    this.projectNeeds.next(this._list);
  }
  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  viewOnly = false;
  private recordChanged$: Subject<ProjectNeed | null> =
    new Subject<ProjectNeed | null>();
  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    public lang: LangService,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
  }

  get projectNeedsForm(): FormArray {
    return this.form.get('projectNeeds') as FormArray;
  }
  // tslint:disable-next-line: adjacent-overload-signatures
  get list(): ProjectNeeds {
    return this._list;
  }
  isAddingAllowed(): boolean {
    return !this.readonly;
  }
  buildForm(): void {
    this.form = this.fb.group({
      projectNeeds: this.fb.array([]),
    });
  }
  save(): void {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }
  cancel(): void {
    this.resetForm();
    this.readyEvent.emit('READY');
    this.editRecordIndex = -1;
  }

  private resetForm(): void {
    this.projectNeedsForm.clear();
    this.projectNeedsForm.markAsUntouched();
    this.projectNeedsForm.markAsPristine();
  }
  private listenToAdd(): void {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.recordChanged$.next(new ProjectNeed());
    });
  }
  private listenToRecordChange(): void {
    this.recordChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((projectNeed) => {
        this.currentRecord = projectNeed || undefined;
        this.updateForm(this.currentRecord);
      });
  }
  private updateForm(projectNeed: ProjectNeed | undefined): void {
    const projectNeedsFormArray = this.projectNeedsForm;
    projectNeedsFormArray.clear();
    if (projectNeed) {
      if (this.viewOnly) {
        this.readyEvent.emit('READY');
      } else {
        this.readyEvent.emit('NOT_READY');
      }
      projectNeedsFormArray.push(this.fb.group(projectNeed.buildForm(true)));
      if (this.readonly || this.viewOnly) {
        this.projectNeedsForm.disable();
      }
    } else {
      this.readyEvent.emit('READY');
    }
  }
  private listenToSave() {
    const bankAccountForm$ = this.save$.pipe(
      map(() => {
        return this.form.get('projectNeeds.0') as AbstractControl;
      })
    );

    const validForm$ = bankAccountForm$.pipe(filter((form) => form.valid));
    const invalidForm$ = bankAccountForm$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$.pipe(take(1))
        .subscribe(() => {
          this.form.get('projectNeeds')?.markAllAsTouched();
        });
    });

    validForm$
      .pipe(
        takeUntil(this.destroy$),
        map(() => {
          return this.form.get('projectNeeds.0') as FormArray;
        }),
        map((form) => {
          return new ProjectNeed().clone({
            ...this.currentRecord,
            ...form.getRawValue(),
          });
        })
      )
      .subscribe((projectNeeds) => {
        if (!projectNeeds) {
          return;
        }

        this._updateList(
          projectNeeds,
          this.editRecordIndex > -1 ? 'UPDATE' : 'ADD',
          this.editRecordIndex
        );
        this.toastService.success(this.lang.map.msg_save_success);
        this.editRecordIndex = -1;
        this.viewOnly = false;
        this.recordChanged$.next(null);
      });
  }
  private _updateList(
    record: ProjectNeed | null,
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
    this.list = this.list.slice();
    this.projectNeeds.next(this.list);
  }

  deleteRow($event: MouseEvent, record: ProjectNeed, index: number): any {
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

  viewRow($event: MouseEvent, record: ProjectNeed, index: number) {
    $event.preventDefault();
    this.editRecordIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }
  editRow($event: MouseEvent, record: ProjectNeed, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editRecordIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }
}
