import { Component, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { ProjectNeed } from '@app/models/project-needs';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'project-needs-popup',
  templateUrl: './project-needs-popup.component.html',
  styleUrls: ['./project-needs-popup.component.scss']
})
export class ProjectNeedsPopupComponent {
  form: UntypedFormGroup;
  viewOnly: boolean;
  readonly: boolean;
  editRecord: ProjectNeed;
  model: ProjectNeed;
  projectNeedsForm: UntypedFormArray;
  customValidators = CustomValidators
  inputMaskPatterns = CustomValidators.inputMaskPatterns

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    viewOnly: boolean,
    readonly: boolean,
    editRecord: ProjectNeed,
    model: ProjectNeed,
    projectNeedsForm: UntypedFormArray,
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.viewOnly = data.viewOnly;
    this.readonly = data.readonly;
    this.editRecord = data.editRecord;
    this.model = data.model;
    this.projectNeedsForm = data.projectNeedsForm;
  }
  mapFormTo(form: any): ProjectNeed {
    const model: ProjectNeed = new ProjectNeed().clone(form);

    return model;
  }

  cancel() {
    this.dialogRef.close(null)
  }
  
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
