import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, } from '@angular/forms';
import { CaseTypes } from '@enums/case-types.enum';
import { UserClickOn } from '@enums/user-click-on.enum';
import { ProjectNeed, ProjectNeeds } from '@models/project-needs';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { CustomValidators } from '@app/validators/custom-validators';
import { ProjectNeedsPopupComponent } from './project-needs-popup/project-needs-popup.component';

@Component({
  selector: 'project-needs',
  templateUrl: './project-needs.component.html',
  styleUrls: ['./project-needs.component.scss'],
})
export class ProjectNeedsComponent implements OnInit, AfterViewInit {
  private _list: ProjectNeeds = [];
  private currentRecord?: ProjectNeed;
  private save$: Subject<any> = new Subject<any>();
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  form!: UntypedFormGroup;
  add$: Subject<any> = new Subject<any>();
  columns = [
    'projectName',
    'projectDescription',
    'beneficiaries',
    'goals',
    'totalCost',
    'actions',
  ];
  footerColumns: string[] = ['totalCostFooterLabel', 'totalCostFooter'];
  footerLabelColSpan: number = this.columns.length - 2;
  projectNeeds = new BehaviorSubject<ProjectNeeds>([]);
  editRecordIndex = -1;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  @Input() readonly = false;
  @Input() caseType?: CaseTypes;

  @Input() set list(list: ProjectNeeds) {
    this._list = list;
    this.projectNeeds.next(this._list);
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  viewOnly = false;
  private recordChanged$: Subject<ProjectNeed | null> =
    new Subject<ProjectNeed | null>();
  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    public lang: LangService,
    private fb: UntypedFormBuilder,
    private dialogService: DialogService,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
  }

  ngAfterViewInit() {
    this._setFooterLabelColspan();
  }

  get projectNeedsForm(): UntypedFormArray {
    return this.form.get('projectNeeds') as UntypedFormArray;
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

  private _setFooterLabelColspan(): void {
    if (this.readonly) {
      this.footerLabelColSpan = this.columns.length - 1;
    } else {
      this.footerLabelColSpan = this.columns.length - 2;
    }
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
      this.openFormPopup();
      projectNeedsFormArray.push(this.fb.group(projectNeed.buildForm(true)));
      if (this.readonly || this.viewOnly) {
        this.projectNeedsForm.disable();
      } else {
        this.projectNeedsForm.enable()
      }
    } else {
      this.readyEvent.emit('READY');
    }
  }

  private listenToSave() {
    this.save$.pipe(
      map(() => {
        return this.form.get('projectNeeds.0') as AbstractControl;
    })).pipe(
        takeUntil(this.destroy$),
        map(() => {
          return this.form.get('projectNeeds.0') as UntypedFormArray;
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

  calculateTotalCost(): number {
    if (!this.list || this.list.length === 0) {
      return 0;
    } else {
      return this.list.map(x => {
        if (!x.totalCost) {
          return 0;
        }
        return Number(Number(x.totalCost).toFixed(2));
      }).reduce((resultSum, a) => resultSum + a, 0);
    }
  }
  _getPopupComponent() {
    return ProjectNeedsPopupComponent;
  }
  openFormPopup() {
    this.dialogService.show(this._getPopupComponent(), {
      form : this.form,
      viewOnly : this.viewOnly,
      readonly : this.readonly,
      editRecordIndex : this.editRecordIndex,
      model : this.currentRecord,
      projectNeedsForm : this.projectNeedsForm,
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save()
      } else {
        this.cancel();
      }
    })
  }
}
