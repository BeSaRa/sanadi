import { AdminResult } from "@models/admin-result";
import { Cloneable } from "@models/cloneable";
import { ImplementationFundraisingInterceptor } from "@model-interceptors/implementation-fundraising-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { CommonUtils } from "@app/helpers/common-utils";
import { ControlValueLabelLangKey } from "@app/types/types";
import { IAuditModelProperties } from "@app/interfaces/i-audit-model-properties";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";

const { send, receive } = new ImplementationFundraisingInterceptor()

@InterceptModel({ send, receive })
export class ImplementationFundraising extends Cloneable<ImplementationFundraising> implements IAuditModelProperties<ImplementationFundraising> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  arabicName!: string
  englishName!: string
  projectLicenseFullSerial!: string
  projectLicenseSerial!: number
  projectLicenseId!: string
  permitType!: number
  projectTotalCost!: number
  remainingAmount!: number
  consumedAmount!: number
  totalCost!: number
  notes: string = ''
  templateId?: string
  permitTypeInfo!: AdminResult
  isMain!: boolean;


  getAdminResultByProperty(property: keyof ImplementationFundraising): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'permitType':
        adminResultValue = this.permitTypeInfo;
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      arabicName: { langKey: 'lbl_arabic_name', value: this.arabicName },
      englishName: { langKey: 'lbl_english_name', value: this.englishName },
      projectLicenseFullSerial: { langKey: 'license_number', value: this.projectLicenseFullSerial },
      permitType: { langKey: 'permit_type', value: this.permitType },
      projectTotalCost: { langKey: 'project_total_cost', value: this.projectTotalCost },
      totalCost: { langKey: 'total_cost', value: this.totalCost },
      remainingAmount: { langKey: 'remaining_amount', value: this.remainingAmount },
      consumedAmount: { langKey: 'consumed_amount', value: this.consumedAmount },
      templateId: { langKey: 'lbl_template', value: this.templateId },
      notes: { langKey: 'notes', value: this.notes },
      projectLicenseId: { langKey: {} as keyof ILanguageKeys, value: this.projectLicenseId },
    };
  }
}
