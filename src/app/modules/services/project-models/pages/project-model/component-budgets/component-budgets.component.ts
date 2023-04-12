import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ProjectComponent } from '@app/models/project-component';
import { ProjectModel } from '@app/models/project-model';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComponentBudgetsPopupComponent } from './component-budgets-popup/component-budgets-popup.component';
import { DialogService } from '@app/services/dialog.service';

@Component({
  selector: 'component-budgets',
  templateUrl: './component-budgets.component.html',
  styleUrls: ['./component-budgets.component.scss']
})
export class ComponentBudgetsComponent implements OnInit, OnDestroy{
  projectComponentChange$: Subject<{ operation: OperationTypes, model: ProjectComponent }> = new Subject<{ operation: OperationTypes, model: ProjectComponent }>();
  destroy$: Subject<any> = new Subject<any>();
  currentEditedProjectComponent?: ProjectComponent;
  columns: string[] = ['componentName', 'details', 'totalCost', 'actions'];
  footerColumns: string[] = ['totalComponentCostLabel', 'totalComponentCost'];
  add$: Subject<any> = new Subject<any>();
  form!:UntypedFormGroup
  @Input('model') model!:ProjectModel | undefined;
  @Input('readonly') readonly!:boolean;
  constructor(public lang: LangService,
    public fb: UntypedFormBuilder,
    private toast: ToastService,
    private dialogService:DialogService,
    ) {
  }
  filterControl: UntypedFormControl = new UntypedFormControl('');
  ngOnInit(): void {
    this.buildForm()
    this.listenToProjectComponentChange();
    this.listenToAdd()
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  listenToAdd(): void {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => this.onClickAddProjectComponent());
  }
  buildForm(){
    let model = new ProjectModel();
    this.form = this.fb.group({
      projectTotalCost: [model.projectTotalCost, [CustomValidators.required, CustomValidators.decimal(2)]],
      componentList: this.fb.array([])
    })
  }
  get currentProjectComponent(): AbstractControl {
    return this.componentBudgetArray.get('0') as AbstractControl;
  }

  onClickEditProjectComponent(model: ProjectComponent): void {
    this.currentEditedProjectComponent = model;
    this.openFormPopup()
    this.projectComponentChange$.next({operation: OperationTypes.UPDATE, model: model});
  }
  
  onClickDeleteProjectComponent(model: ProjectComponent): void {
    this.projectComponentChange$.next({operation: OperationTypes.DELETE, model: model});
  }
  
  onClickAddProjectComponent(): void {
    this.currentEditedProjectComponent = undefined;
    this.openFormPopup()
    this.projectComponentChange$.next({operation: OperationTypes.CREATE, model: new ProjectComponent()});
  }

  saveProjectComponent(): void {
    if (this.currentProjectComponent.invalid) {
      return;
    }
    if (this.currentEditedProjectComponent) {
      this.model && this.model.componentList.splice(this.model.componentList.indexOf(this.currentEditedProjectComponent), 1, (new ProjectComponent()).clone({...this.currentProjectComponent.value}));
      this.model && (this.model.componentList = this.model.componentList.slice());
    } else {
      const list = this.model?.componentList ? this.model?.componentList : [];
      this.model && (this.model.componentList = list.concat(new ProjectComponent().clone({...this.currentProjectComponent.value})));
    }
    this.toast.success(this.lang.map.msg_save_success);
    this.projectTotalCostField.setValue(this.model?.getTotalProjectComponentCost(2) ?? 0);
    this.cancelProjectComponent();
  }

  cancelProjectComponent(): void {
    this.componentBudgetArray.removeAt(0);
  }

  private createProjectComponentForm(model: ProjectComponent): void {
    !this.componentBudgetArray.length ? this.componentBudgetArray.push(this.fb.group(model.buildForm(true))) : null;
  }

  private removeProjectComponentForm(model: ProjectComponent) {
    this.componentBudgetArray.removeAt(0);
    this.model?.componentList.splice(this.model?.componentList.indexOf(model), 1);
    this.model && (this.model.componentList = this.model?.componentList.slice());
  }

  listenToProjectComponentChange() {
    this.projectComponentChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        event.operation === OperationTypes.DELETE ? this.removeProjectComponentForm(event.model) : this.createProjectComponentForm(event.model);
        this.projectTotalCostField.setValue(this.model?.getTotalProjectComponentCost(2) ?? 0);
      });
  }

  get projectTotalCostField(): AbstractControl {
    return this.form.get('projectTotalCost') as AbstractControl;
  }

  get componentBudgetArray(): UntypedFormArray {
    return this.form.get('componentList') as UntypedFormArray;
  }
  updateForm(model:ProjectModel){
    this.form.patchValue({
        projectTotalCost: model.projectTotalCost,
        componentList: []
    })
  }
  _getPopupComponent() {
    return ComponentBudgetsPopupComponent;
  }


  openFormPopup() {
    this.dialogService.show(this._getPopupComponent(), {
      form: this.form,
      readonly: this.readonly,
      editIndex: this.currentEditedProjectComponent? true: false,
      model: this.model,
      componentBudgetArray:this.componentBudgetArray
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.saveProjectComponent()
      } else {
        this.cancelProjectComponent();
      }
    })
  }
}
