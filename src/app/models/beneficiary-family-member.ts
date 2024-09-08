import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {Lookup} from '@models/lookup';

export class BeneficiaryFamilyMember extends SearchableCloneable<BeneficiaryFamilyMember> {
  id?: number;

  primaryIdNumber!: string;
  primaryIdType!: number;
  arName!: string;
  gender!: number;
  age!: number;
  relativeType!: number;
  occuption!: string;
  aidLookupId!: number;
  aidLookupParentId!: number;

  primaryIdTypeInfo!: Lookup;
  relativeTypeInfo!: Lookup;

  updatedBy!: number;
  clientData!: string;

  searchFields: ISearchFieldsMap<BeneficiaryFamilyMember> = {
  }

  buildForm(controls?: boolean): any {
    const {
      primaryIdNumber,
      primaryIdType,
      arName,
      gender,
      age,
      relativeType,
      occuption,
      aidLookupId,
      aidLookupParentId
    } = this;
    return {
      primaryIdNumber: controls ? [primaryIdNumber, [CustomValidators.required]] : primaryIdNumber,
      primaryIdType: controls ? [primaryIdType, [CustomValidators.required]] : primaryIdType,
      arName: controls ? [arName, [CustomValidators.required]] : arName,
      gender: controls ? [gender, [CustomValidators.required]] : gender,
      age: controls ? [age, [CustomValidators.required]] : age,
      relativeType: controls ? [relativeType, [CustomValidators.required]] : relativeType,
      occuption: controls ? [occuption, [CustomValidators.required]] : occuption,
      aidLookupId: controls ? [aidLookupId, [CustomValidators.required]] : aidLookupId,
      aidLookupParentId: controls ? [aidLookupParentId, [CustomValidators.required]] : aidLookupParentId,
    }
  }
}
