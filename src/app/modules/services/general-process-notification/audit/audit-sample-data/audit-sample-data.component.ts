import {Component, Input} from '@angular/core';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@app/helpers/common-utils';
import {IFindInList} from '@app/interfaces/i-find-in-list';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CaseAuditService} from '@app/services/case-audit.service';
import {LangService} from '@app/services/lang.service';
import {ControlValueLabelLangKey} from '@app/types/types';
import {GeneralProcessNotification} from "@models/general-process-notification";
import {ObjectUtils} from "@helpers/object-utils";
import {IValueDifference} from "@contracts/i-value-difference";
import {FormBuilder, UntypedFormGroup} from "@angular/forms";
import {
  ProcessFieldBuilder
} from "@app/administration/popups/general-process-popup/process-formly-components/process-fields-builder";
import { TemplateField } from '@app/models/template-field';

@Component({
  selector: 'audit-sample-data',
  templateUrl: 'audit-sample-data.component.html',
  styleUrls: ['audit-sample-data.component.scss']
})
export class AuditSampleDataComponent extends AuditListGenericComponent<TemplateField> {
  @Input() newVersion!: GeneralProcessNotification;
  @Input() oldVersion!: GeneralProcessNotification;

  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService,
              private fb: FormBuilder) {
    super();
  }

  isProcessChanged: boolean = false;
  differencesList: IValueDifference[] = [];
  oldForm!: UntypedFormGroup;
  newForm!: UntypedFormGroup;
  newProcessFieldBuilder!: ProcessFieldBuilder;
  oldProcessFieldBuilder!: ProcessFieldBuilder;
  formReady: boolean = false;

  displayColumns: string[] = [];
  actions: IMenuItem<TemplateField>[] = [];

  protected _afterViewInit() {
    this.isProcessChanged = this.newVersion.processid !== this.oldVersion.processid;

    if (!this.isProcessChanged) {
      this._getSampleDataDifferences();
    } else {
      this._generateFormlyForms();
    }
  }

  _getNewInstance(override: Partial<TemplateField> | undefined): TemplateField {
    if (CommonUtils.isValidValue(override)) {
      return new TemplateField().clone(override)
    }
    return new TemplateField();
  }

  getControlLabels(item: TemplateField): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<TemplateField>): TemplateField | undefined {
    return objComparison.listToCompareWith.find((item) => item.id === objComparison.itemToCompare.id);
  }

  private _getSampleDataDifferences(): void {
    this.newVersion.parsedTemplates.forEach((newVersionFullModel) => {
      const oldVersionFullModel = this.oldVersion.parsedTemplates.find(x => x.id === newVersionFullModel.id) ?? new TemplateField();
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
    this.oldProcessFieldBuilder.generateFromString(this.oldVersion?.template);

    this.newForm = this.fb.group({});
    this.newProcessFieldBuilder = new ProcessFieldBuilder();
    this.newProcessFieldBuilder.buildMode = 'view';
    this.newProcessFieldBuilder.generateFromString(this.newVersion?.template);

    this.formReady = true;

  }
}
