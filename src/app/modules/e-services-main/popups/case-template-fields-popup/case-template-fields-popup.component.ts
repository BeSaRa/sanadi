import { Component, Inject, AfterViewInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { ProcessFieldBuilder } from '@app/administration/popups/general-process-popup/process-formly-components/process-fields-builder';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IHasParsedTemplates } from '@app/interfaces/i-has-parsed-templates';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { AdminResult } from '@app/models/admin-result';
import { TemplateField } from '@app/models/template-field';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'case-template-fields-popup',
  templateUrl: 'case-template-fields-popup.component.html',
  styleUrls: ['case-template-fields-popup.component.scss']
})
export class CaseTemplateFieldsPopupComponent implements AfterViewInit {
  oldForm!: UntypedFormGroup;
  newForm!: UntypedFormGroup;
  newProcessFieldBuilder!: ProcessFieldBuilder;
  oldProcessFieldBuilder!: ProcessFieldBuilder;
  isProcessChanged: boolean = false;
  differencesList: IValueDifference[] = [];

  formReady: boolean = false;
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    titleInfo: AdminResult,
    newItem: IHasParsedTemplates,
    oldItem: IHasParsedTemplates
  },
    public lang: LangService,
    private fb: FormBuilder) {
  }
  ngAfterViewInit() {
    this.isProcessChanged = this.data.newItem.templateId !== this.data.newItem.templateId;
    if (!this.isProcessChanged) {
      this._getSampleDataDifferences();
    } else {
      this._generateFormlyForms();
    }
  }
  get popupTitle(): string {
    return this.lang.map.view_changes
  }
  private _getSampleDataDifferences(): void {
    this.data.newItem.parsedTemplates.forEach((newVersionFullModel) => {
      const oldVersionFullModel = this.data.oldItem.parsedTemplates.find(x => x.id === newVersionFullModel.id) ?? new TemplateField();
      const newVersionDataModel: Partial<TemplateField> = ObjectUtils.getControlComparisonValues<TemplateField>(newVersionFullModel.getValuesWithLabels());
      const oldVersionDataModel: Partial<TemplateField> = ObjectUtils.getControlComparisonValues<TemplateField>(oldVersionFullModel.getValuesWithLabels() ?? {});
      const labelLangKeys = ObjectUtils.getControlLabels(newVersionFullModel.getValuesWithLabels());
      const differences = ObjectUtils.getValueDifferencesList<TemplateField, TemplateField>(newVersionFullModel, oldVersionFullModel, newVersionDataModel, oldVersionDataModel, labelLangKeys);
       this.differencesList = this.differencesList.concat(differences);
    });
  }

  private _generateFormlyForms() {
    this.oldForm = this.fb.group({});
    this.oldProcessFieldBuilder = new ProcessFieldBuilder();
    this.oldProcessFieldBuilder.buildMode = 'view';
    this.oldProcessFieldBuilder.generateFromString(this.data.oldItem?.template);

    this.newForm = this.fb.group({});
    this.newProcessFieldBuilder = new ProcessFieldBuilder();
    this.newProcessFieldBuilder.buildMode = 'view';
    this.newProcessFieldBuilder.generateFromString(this.data.newItem?.template);

    this.formReady = true;

  }

}
