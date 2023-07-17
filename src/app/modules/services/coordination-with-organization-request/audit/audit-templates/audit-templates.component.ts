import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { ProcessFieldBuilder } from '@app/administration/popups/general-process-popup/process-formly-components/process-fields-builder';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { TemplateFieldTypes } from '@app/enums/template-field-types.enum';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { IValueDifference } from '@app/interfaces/i-value-difference';
import { CoordinationWithOrganizationTemplate } from '@app/models/corrdination-with-organization-template';
import { DynamicModel } from '@app/models/dynamic-model';
import { TemplateField } from '@app/models/template-field';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { DynamicModelService } from '@app/services/dynamic-models.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { M } from 'angular-mydatepicker';

@Component({
  selector: 'audit-templates',
  templateUrl: 'audit-templates.component.html',
  styleUrls: ['audit-templates.component.scss']
})
export class AuditTemplatesComponent extends AuditListGenericComponent<CoordinationWithOrganizationTemplate> implements OnInit {
  fieldBuilder: ProcessFieldBuilder;
  usedModel!: DynamicModel;

  @Input() templateId!: number | undefined;


  constructor(public lang: LangService,
    private dynamicModelService: DynamicModelService,
    public caseAuditService: CaseAuditService) {
    super();
    this.fieldBuilder = new ProcessFieldBuilder();
  }
  ngOnInit(): void {
    if (this.templateId)
      this.dynamicModelService.getById(this.templateId).subscribe((model: DynamicModel) => {
        this.usedModel = model;
        this.fieldBuilder.generateFromString(model.template);
        this.displayColumns = this.fieldBuilder.fields.reduce((p, c) => {
          if (c.showOnTable)
            return [c.identifyingName, ...p];
          else return p;
        }, this.displayColumns)
      })
  }
  getHeaderName(col: string) {
    return this.fieldBuilder.fields.find(f => f.identifyingName == col)?.getName() || col
  }
  getCellValue(row: CoordinationWithOrganizationTemplate, col: string) {
    if (!row.generatedTemplate)
      return '---';
    const field = row.generatedTemplate.find(f => f.identifyingName == col);
    if (field?.value) {
      if (field?.type == TemplateFieldTypes.dateField) {
        return DateUtils.getDateStringFromDate(field?.value);
      } else if (field?.type == TemplateFieldTypes.selectField || field?.type == TemplateFieldTypes.yesOrNo) {
        return field.options.find(o => o.id == field.value)?.name;
      }
      return field?.value;
    } else {
      return '---';
    }
  }
  displayColumns: string[] = ['actions'];
  actions: IMenuItem<CoordinationWithOrganizationTemplate>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<CoordinationWithOrganizationTemplate> | undefined): CoordinationWithOrganizationTemplate {
    if (CommonUtils.isValidValue(override)) {
      return new CoordinationWithOrganizationTemplate().clone(override)
    }
    return new CoordinationWithOrganizationTemplate().clone({});
  }
  // _getNewTemplateFieldInstance(override: Partial<CoordinationWithOrganizationTemplate> | undefined): TemplateField[] {
  //   if (CommonUtils.isValidValue(override)) {
  //     return new CoordinationWithOrganizationTemplate().clone(override).parsedTemplates
  //   }
  //   return new CoordinationWithOrganizationTemplate().parsedTemplates;
  // }

  getControlLabels(item: CoordinationWithOrganizationTemplate): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<CoordinationWithOrganizationTemplate>): CoordinationWithOrganizationTemplate | undefined {
    return objComparison.listToCompareWith.find((item) => item.id === objComparison.itemToCompare.id);
  }
  showRecordDifferences(item: CoordinationWithOrganizationTemplate): void {
    if (item.auditOperation === AuditOperationTypes.NO_CHANGE) {
      return;
    }
    // const labelLangKeys = ObjectUtils.getControlLabels(this.getControlLabels(item));
    // let differencesList: IValueDifference[] = [];
    let newVersionFullModel: CoordinationWithOrganizationTemplate;
    let oldVersionFullModel: CoordinationWithOrganizationTemplate;
    // let newVersionDataModel: Partial<CoordinationWithOrganizationTemplate> = {};
    // let oldVersionDataModel: Partial<CoordinationWithOrganizationTemplate> = {};

    if (item.auditOperation === AuditOperationTypes.DELETED) {
      newVersionFullModel = this._getNewInstance({});
      oldVersionFullModel = item;
    } else if (item.auditOperation === AuditOperationTypes.ADDED) {
      newVersionFullModel = item;
      oldVersionFullModel = this._getNewInstance({});
    } else {
      const newVersionItem = this.existsInList({
        itemToCompare: item,
        listToCompareWith: this.newVersionList,
        propertyToCompare: this.uniqueComparisonProperty
      });
      if (!newVersionItem) {
        return;
      }
      newVersionFullModel = newVersionItem;
      oldVersionFullModel = item;
    }
    // newVersionDataModel = ObjectUtils.getControlComparisonValues<CoordinationWithOrganizationTemplate>(this.getControlLabels(newVersionFullModel));
    // oldVersionDataModel = ObjectUtils.getControlComparisonValues<CoordinationWithOrganizationTemplate>(this.getControlLabels(oldVersionFullModel));
    // differencesList = ObjectUtils.getValueDifferencesList<CoordinationWithOrganizationTemplate, CoordinationWithOrganizationTemplate>(newVersionFullModel, oldVersionFullModel, newVersionDataModel, oldVersionDataModel, labelLangKeys);

    this.caseAuditService.showTemplateFieldsDifferencesPopup(newVersionFullModel,oldVersionFullModel, this.getDifferencesPopupTitle(item));
  }


}
