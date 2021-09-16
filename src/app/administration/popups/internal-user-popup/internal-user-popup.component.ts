import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {AdminGenericDialog} from "@app/generics/admin-generic-dialog";
import {InternalUser} from "@app/models/internal-user";
import {FormBuilder, FormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {IDialogData} from "@app/interfaces/i-dialog-data";
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from "@app/shared/models/dialog-ref";
import {Observable} from 'rxjs';
import {InternalDepartmentService} from "@app/services/internal-department.service";
import {InternalDepartment} from "@app/models/internal-department";
import {takeUntil} from "rxjs/operators";
import {Lookup} from "@app/models/lookup";
import {LookupService} from '@app/services/lookup.service';
import {LookupCategories} from '@app/enums/lookup-categories';

@Component({
  selector: 'internal-user-popup',
  templateUrl: './internal-user-popup.component.html',
  styleUrls: ['./internal-user-popup.component.scss']
})
export class InternalUserPopupComponent extends AdminGenericDialog<InternalUser> {
  operation: OperationTypes;
  model: InternalUser;
  form!: FormGroup;
  departments: InternalDepartment[] = [];
  jobTitles: Lookup[] = [];
  statusList: Lookup[] = [];

  constructor(public dialogRef: DialogRef,
              public lang: LangService,
              private internalDep: InternalDepartmentService,
              public fb: FormBuilder,
              private lookupService: LookupService,
              @Inject(DIALOG_DATA_TOKEN) public data: IDialogData<InternalUser>) {
    super();
    this.model = this.data.model;
    this.operation = this.data.operation;
    this.statusList = lookupService.getByCategory(LookupCategories.COMMON_STATUS);
  }

  initPopup(): void {
    this.loadDepartments();
    this.loadJobTitles();
  }

  destroyPopup(): void {

  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  //TODO: when the job title service be ready should change implementation here and load if from API
  private loadJobTitles() {
    this.jobTitles = [
      (new Lookup()).clone({enName: 'مسمي وظيفى اول', arName: 'jobTitle 1', id: 1}),
      (new Lookup()).clone({enName: 'مسمي وظيفي ثانى', arName: 'jobTitle 2', id: 2}),
      (new Lookup()).clone({enName: 'مسمي وظيفي ثالث', arName: 'jobTitle 3', id: 2})
    ]
  }

  private loadDepartments(): void {
    this.internalDep.load()
      .pipe(takeUntil(this.destroy$))
      .subscribe((departments) => {
        this.departments = departments;
      });
  }

  afterSave(model: InternalUser, dialogRef: DialogRef): void {
    // here i closing the popup after click on save and the operation is update
    this.operation === OperationTypes.UPDATE && dialogRef.close(model);
    // here i change operation to UPDATE after first save
    this.operation === OperationTypes.CREATE && (this.operation = OperationTypes.UPDATE);
  }

  beforeSave(model: InternalUser, form: FormGroup): boolean | Observable<boolean> {
    return form.valid;
  }

  prepareModel(model: InternalUser, form: FormGroup): InternalUser | Observable<InternalUser> {
    return (new InternalUser()).clone({...model, ...form.value});
  }

  saveFail(error: Error): void {
    console.log(error);
  }

  basicInfoHasError() {
    return (this.form.invalid && (this.form.touched || this.form.dirty));
  }

}
