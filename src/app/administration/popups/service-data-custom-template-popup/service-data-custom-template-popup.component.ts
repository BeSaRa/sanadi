import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, UntypedFormGroup} from "@angular/forms";
import {LangService} from "@services/lang.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {CustomServiceTemplate} from "@models/custom-service-template";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {LookupService} from "@services/lookup.service";
import {OperationTypes} from "@enums/operation-types.enum";
import {CaseTypes} from "@enums/case-types.enum";
import {Lookup} from "@models/lookup";
import {FileExtensionsEnum} from "@enums/file-extension-mime-types-icons.enum";
import {CommonUtils} from "@helpers/common-utils";
import {take} from "rxjs/operators";
import {DialogService} from "@services/dialog.service";
import {ToastService} from "@services/toast.service";
import {CustomServiceTemplateService} from "@services/custom-service-template.service";

@Component({
  selector: 'service-data-custom-template-popup',
  templateUrl: './service-data-custom-template-popup.component.html',
  styleUrls: ['./service-data-custom-template-popup.component.scss']
})
export class ServiceDataCustomTemplatePopupComponent implements OnInit, AfterViewInit {
  form!: UntypedFormGroup;
  model: CustomServiceTemplate;
  operation: OperationTypes;
  caseType: CaseTypes;
  readonly: boolean = false;
  list: CustomServiceTemplate[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: {
                model: CustomServiceTemplate,
                operation: OperationTypes,
                caseType: CaseTypes,
                list: CustomServiceTemplate[]
              },
              public lang: LangService,
              private dialogRef: DialogRef,
              private toast: ToastService,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private customServiceTemplate: CustomServiceTemplateService,
              private fb: FormBuilder) {

    this.model = data.model;
    this.caseType = data.caseType;
    this.operation = data.operation;
    this.list = data.list;
  }

  approvalTemplateTypes: Lookup[] = this.lookupService.listByCategory.ApprovalTemplateType;
  templateFile?: File;
  fileExtensionsEnum = FileExtensionsEnum;
  @ViewChild('dialogContent') dialogContent!: ElementRef;

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity(form ?? this.form, element);
  }

  ngOnInit() {
    this.buildForm();
  }

  ngAfterViewInit() {
    Promise.resolve().then(() => {
      if (this.operation == OperationTypes.VIEW) {
        this.readonly = true;
        this.form.disable();
      }
      if (this.operation === OperationTypes.UPDATE) {
        this.displayFormValidity(this.form, this.dialogContent.nativeElement);
      }
    })
  }

  private buildForm() {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  setTemplateFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.templateFile = file;
    } else {
      this.templateFile = file[0];
    }
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_x.change({x: this.lang.map.lbl_template});
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_x.change({x: this.lang.map.lbl_template + ' : ' +  this.model.getName()});
    } else {
      return this.lang.map.lbl_view_x.change({x: this.lang.map.lbl_template + ' : ' +  this.model.getName()});
    }
  }

  private isDuplicateFn(formValue: Partial<CustomServiceTemplate>, list: CustomServiceTemplate[]): boolean {
    return list.some(item => {
      return item.arabicName === formValue.arabicName
        && item.englishName === formValue.englishName
        && item.approvalTemplateType === formValue.approvalTemplateType
    });
  }

  private isDuplicatedTemplate(formValue: Partial<CustomServiceTemplate>): boolean {
    if (this.operation === OperationTypes.CREATE) {
      return this.isDuplicateFn(formValue, this.list);
    }
    if (this.operation === OperationTypes.UPDATE) {
      return this.isDuplicateFn(formValue, this.list.filter(x => x.id !== this.model.id));
    }
    return false;
  }

  prepareModel(model: CustomServiceTemplate, form: UntypedFormGroup): CustomServiceTemplate {
    return (new CustomServiceTemplate()).clone({...model, ...form.value, isOriginal: true});
  }

  private beforeSave(): boolean {
    if (this.readonly) {
      return false;
    }
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    if (this.isDuplicatedTemplate(this.form.getRawValue())) {
      this.toast.alert(this.lang.map.msg_duplicated_item);
      return false;
    }
    if (this.operation === OperationTypes.CREATE && !this.templateFile) {
      this.toast.error(this.lang.map.msg_upload_missing_x.change({x: this.lang.map.template_file}));
      return false;
    }
    return true;
  }

  save(): void {
    if (!this.beforeSave()) {
      return;
    }

    let data: CustomServiceTemplate = this.prepareModel(this.model, this.form);
    let request;
    if (this.operation === OperationTypes.CREATE) {
      request = this.customServiceTemplate.addTemplate(this.caseType, data, this.templateFile!);
    } else {
      if (!!this.templateFile) {
        request = this.customServiceTemplate.updateContent(this.caseType, data, this.templateFile);
      } else {
        request = this.customServiceTemplate.updateProp(this.caseType, data);
      }
    }

    request.subscribe((record) => {
      if (!record) {
        return;
      }
      this.toast.success(this.lang.map.msg_save_success);
      this.dialogRef.close(record);
    })
  }

  private displayRequiredFieldsMessage(): void {
    this.dialogService
      .error(this.lang.map.msg_all_required_fields_are_filled)
      .onAfterClose$.pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }

}
