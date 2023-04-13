import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CharityBranchInterceptor } from '@app/model-interceptors/charity-branch-interceptor';
import { CustomValidators } from '@app/validators/custom-validators';
import { OrganizationOfficer } from './organization-officer';
import { SearchableCloneable } from './searchable-cloneable';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {AdminResult} from '@models/admin-result';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';

const interceptor = new CharityBranchInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class CharityBranch extends SearchableCloneable<CharityBranch> implements IAuditModelProperties<CharityBranch>{
  branchId!: number;
  fullName!: string;
  category!: number;
  branchAdjective!: number;
  usageAdjective!: number;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  tempId!: number;
  branchContactOfficer: OrganizationOfficer[] = [];
  branchContactOfficerList: OrganizationOfficer[] = [];

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getAdminResultByProperty(property: keyof CharityBranch): AdminResult {
    return AdminResult.createInstance({});
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
