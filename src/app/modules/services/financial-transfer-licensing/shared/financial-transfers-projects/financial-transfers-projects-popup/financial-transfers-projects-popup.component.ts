import { Component, Inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ExternalProjectLicensing } from '@app/models/external-project-licensing';
import { FinancialTransfersProject } from '@app/models/financial-transfers-project';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'financial-transfers-projects-popup',
  templateUrl: './financial-transfers-projects-popup.component.html',
  styleUrls: ['./financial-transfers-projects-popup.component.scss']
})
export class FinancialTransfersProjectsPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: FinancialTransfersProject;
  financialTransferProjectControl: UntypedFormControl;
  approvedFinancialTransferProjects: ExternalProjectLicensing[]
  selectedProject: FinancialTransfersProject;
  inputMaskPatterns = CustomValidators.inputMaskPatterns
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: FinancialTransfersProject,
    financialTransferProjectControl: UntypedFormControl,
    approvedFinancialTransferProjects: ExternalProjectLicensing[],
    selectedProject: FinancialTransfersProject,
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.financialTransferProjectControl = data.financialTransferProjectControl;
    this.approvedFinancialTransferProjects = data.approvedFinancialTransferProjects;
    this.selectedProject = data.selectedProject

  }

  ngOnInit() {
  }
  mapFormTo(form: any): FinancialTransfersProject {
    const model: FinancialTransfersProject = new FinancialTransfersProject().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
