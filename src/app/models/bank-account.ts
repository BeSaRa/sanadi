import { AdminResult } from '@app/models/admin-result';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { CaseTypes } from '@app/enums/case-types.enum';
import { Bank } from '@app/models/bank';
import { Lookup } from '@app/models/lookup';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { ISearchFieldsMap } from '@app/types/types';

export class BankAccount extends SearchableCloneable<BankAccount> {
  id!: number;
  currency!: number;
  accountNumber!: string;
  bankName!: string;
  iBan!: string;
  swiftCode!: string;
  country!: number;
  partnerName!: string;
  orgId!:number;
  iBAN!:string;
  category?: number;
  bankInfo!: Bank;
  isMergeAccount!: boolean;
  subAccounts: BankAccount[] = [];
  bankCategoryInfo!: Lookup;
  type!: number;
  currencyInfo!: AdminResult;
  countryInfo!: AdminResult;

  searchFields: ISearchFieldsMap<BankAccount> = {
    ...infoSearchFields(['countryInfo']),
    ...normalSearchFields(['bankName', 'accountNumber', 'iBan']),
  };
  constructor() {
    super();
  }

  getBankAccountFields(control: boolean = false, caseType?: CaseTypes): any {
    const {
      currency,
      accountNumber,
      bankName,
      iBan,
      swiftCode,
      country,
      category,
      partnerName,
    } = this;
    // if no case type or case type is not partner approval
    let showCategory = caseType !== CaseTypes.PARTNER_APPROVAL,
      controls: any = {
        bankName: control
          ? [
              bankName,
              [
                CustomValidators.required,
                CustomValidators.minLength(
                  CustomValidators.defaultLengths.MIN_LENGTH
                ),
                CustomValidators.maxLength(
                  CustomValidators.defaultLengths.ENGLISH_NAME_MAX
                ),
              ],
            ]
          : bankName,
        accountNumber: control
          ? [
              accountNumber,
              [
                CustomValidators.required,
                CustomValidators.number,
                CustomValidators.maxLength(
                  CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
                ),
              ],
            ]
          : accountNumber,
        iBan: control
          ? [
              iBan,
              [
                CustomValidators.required,
                CustomValidators.pattern('ENG_NUM_ONLY'),
                CustomValidators.maxLength(
                  CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
                ),
              ],
            ]
          : iBan,
        swiftCode: control
          ? [
              swiftCode,
              [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.SWIFT_CODE_MIN)
              ],
            ]
          : swiftCode,
        country: control ? [country, [CustomValidators.required]] : country,
        currency: control ? [currency, [CustomValidators.required]] : currency,
      };

    if (showCategory) {
      controls.category = control
        ? [category, [CustomValidators.required]]
        : category;
    } else {
      controls.partnerName = control
        ? [
            partnerName,
            [
              CustomValidators.required,
              CustomValidators.minLength(
                CustomValidators.defaultLengths.MIN_LENGTH
              ),
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : partnerName;
    }

    return controls;
  }
}
