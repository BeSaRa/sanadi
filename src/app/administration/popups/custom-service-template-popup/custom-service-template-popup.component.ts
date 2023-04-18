import { BlobModel } from '@app/models/blob-model';
import { AdminResult } from '@app/models/admin-result';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CustomServiceTemplate } from '@app/models/custom-service-template';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { LookupService } from '@app/services/lookup.service';
import { Lookup } from '@app/models/lookup';
import { ServiceDataService } from '@app/services/service-data.service';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';

@Component({
  selector: 'app-custom-service-template-popup',
  templateUrl: './custom-service-template-popup.component.html',
  styleUrls: ['./custom-service-template-popup.component.scss']
})
export class CustomServiceTemplatePopupComponent implements OnInit {
  form: UntypedFormGroup;
  readOnly: boolean;
  viewOnly: boolean;
  editItem: number;
  caseType: number;
  model: CustomServiceTemplate;
  approvalTemplateTypes: Lookup[] = this.lookupService.listByCategory.ApprovalTemplateType;
  TemplateFile?: File;
  fileExtensionsEnum = FileExtensionsEnum;

  constructor(
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup;
      readOnly: boolean;
      viewOnly: boolean;
      editItem: number;
      model: CustomServiceTemplate;
      caseType: number;
    },
    private dialogRef: DialogRef,
    private lookupService: LookupService
  ) {
    this.form = data.form;
    this.readOnly = data.readOnly;
    this.viewOnly = data.viewOnly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.caseType = data.caseType;
  }

  ngOnInit() {
    if (this.model) {
      this.form.patchValue(this.model);
      if (this.readOnly || this.viewOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  setTemplateFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.TemplateFile = file;
    } else {
      this.TemplateFile = file[0];
    }
  }
  get popupTitle(): string {
    if (this.editItem == -1) {
      return this.lang.map.add_template;
    } else if (this.editItem && !this.viewOnly) {
      return this.lang.map.btn_update + this.lang.map.lbl_template;
    } else if (this.viewOnly) {
      return this.lang.map.view;
    }
    return '';
  }

  mapForm(form: CustomServiceTemplate): CustomServiceTemplate {
    const entity: CustomServiceTemplate = new CustomServiceTemplate().clone({...form});
    entity.id = this.model.id

    return entity;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close({model: this.mapForm(this.form.getRawValue()), file: this.TemplateFile})
  }
}
