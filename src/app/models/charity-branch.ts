import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CharityBranchInterceptor } from '@app/model-interceptors/charity-branch-interceptor';
import { CustomValidators } from '@app/validators/custom-validators';
import { OrganizationOfficer } from './organization-officer';
import { SearchableCloneable } from './searchable-cloneable';

const interceptor = new CharityBranchInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class CharityBranch extends SearchableCloneable<CharityBranch> {
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
      address: controls ? [address, [CustomValidators.required]] : address,
      branchAdjective: controls
        ? [branchAdjective, [CustomValidators.required]]
        : branchAdjective,
      branchContactOfficer: controls,
      buildingNumber: controls
        ? [buildingNumber, [CustomValidators.required]]
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
          ],
        ]
        : fullName,
      zoneNumber: controls
        ? [zoneNumber, [CustomValidators.required]]
        : zoneNumber,
      usageAdjective: controls
        ? [usageAdjective, [CustomValidators.required]]
        : usageAdjective,
      streetNumber: controls
        ? [streetNumber, [CustomValidators.required]]
        : streetNumber,
    };
  }
}
