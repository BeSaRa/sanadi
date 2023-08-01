import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { CharityBranchInterceptor } from '@app/model-interceptors/charity-branch-interceptor';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { OrganizationOfficer } from './organization-officer';
import { SearchableCloneable } from './searchable-cloneable';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {AdminResult} from '@models/admin-result';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlValueLabelLangKey } from '@app/types/types';

const interceptor = new CharityBranchInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class CharityBranch extends SearchableCloneable<CharityBranch> implements IAuditModelProperties<CharityBranch>{
  id!: number;
  branchId!: number;
  fullName!: string;
  category!: number;
  itemId!: string;
  branchAdjective!: number;
  usageAdjective!: number;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  tempId!: number;
  branchContactOfficer: OrganizationOfficer[] = [];
  branchContactOfficerList: OrganizationOfficer[] = [];
  categoryInfo!:AdminResult;
  branchAdjectiveInfo!:AdminResult;
  usageAdjectiveInfo!:AdminResult;
  status!: number;
  statusInfo!:AdminResult;

  searchFields: ISearchFieldsMap<CharityBranch> = {
    ...normalSearchFields(['fullName', 'address', 'streetNumber', 'zoneNumber', 'buildingNumber']),
  }

  getAdminResultByProperty(property: keyof CharityBranch): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'category':
        adminResultValue = this.categoryInfo;
        break;
      case 'branchAdjective':
        adminResultValue = this.branchAdjectiveInfo;
        break;
      case 'usageAdjective':
        adminResultValue = this.usageAdjectiveInfo;
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
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      fullName: { langKey: 'full_name', value: this.fullName },
      address:{ langKey: 'lbl_address', value: this.address },
      branchAdjective:{ langKey: 'branch_adjective', value: this.branchAdjective },
      buildingNumber:{ langKey: 'building_number', value: this.buildingNumber },
      category:{ langKey: 'type', value: this.category },
      zoneNumber:{ langKey: 'lbl_zone', value: this.zoneNumber },
      usageAdjective:{ langKey: 'usage_adjective', value: this.usageAdjective },
      streetNumber:{ langKey: 'lbl_street', value: this.streetNumber },
     };
  }

  buildForm(controls = true) {
    const {
      address,
      branchAdjective,
      buildingNumber,
      category,
      fullName,
      zoneNumber,
      usageAdjective,
      streetNumber,
    } = this;

    return {
      address: controls ? [address, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : address,
      branchAdjective: controls
        ? [branchAdjective, [CustomValidators.required]]
        : branchAdjective,
      branchContactOfficer: controls,
      buildingNumber: controls
        ? [buildingNumber, [CustomValidators.required, CustomValidators.maxLength(5)]]
        : buildingNumber,
      category: controls ? [category, [CustomValidators.required]] : category,
      fullName: controls
        ? [
          fullName,
          [
            CustomValidators.required,
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
            CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)
          ],
        ]
        : fullName,
      zoneNumber: controls
        ? [zoneNumber, [CustomValidators.required, CustomValidators.maxLength(5)]]
        : zoneNumber,
      usageAdjective: controls
        ? [usageAdjective, [CustomValidators.required]]
        : usageAdjective,
      streetNumber: controls
        ? [streetNumber, [CustomValidators.required, CustomValidators.maxLength(5)]]
        : streetNumber,
    };
  }
}
