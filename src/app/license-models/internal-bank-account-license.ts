import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';
import {AdminResult} from '@app/models/admin-result';
import {Lookup} from '@app/models/lookup';
import {BankAccount} from '@app/models/bank-account';
import {Bank} from '@app/models/bank';
import {NpoEmployee} from '@app/models/npo-employee';

export class InternalBankAccountLicense {
  accountNumber!: string;
  bankAccountExecutiveManagementDTOs!: any[];
  bankCategoryInfo!: AdminResult;
  bankId!: number;
  bankInfo!: AdminResult;
  category!: number;
  classDescription!: string;
  createdOn!: string;
  creatorInfo!: AdminResult;
  currency!: number;
  currencyInfo!: AdminResult;
  documentTitle!: string;
  fullSerial!: string;
  iBan!: string;
  id!: string;
  internalBankAccountDTOs!: any[];
  lastModified!: string;
  licenseType!: number;
  lockOwner!: boolean;
  lockTimeout!: boolean;
  mainAccount!: number;
  mainAccountInfo!: AdminResult;
  operationType!: number;
  operationTypeInfo!: AdminResult;
  orgInfo!: AdminResult;
  organizationId!: number;
  ouInfo!: AdminResult;
  purpose!: string;
  serial!: number;
  swiftCode!: string;
  licenseStatusInfo!: Lookup;
  requestTypeInfo!: Lookup;
  isUpdatedNewAccount!: boolean;

  convertToItem(): InternalBankAccountApproval{
    const internalBankAccountApproval = new InternalBankAccountApproval();
    internalBankAccountApproval.oldLicenseId = this.id;
    internalBankAccountApproval.oldLicenseFullSerial = this.fullSerial;
    internalBankAccountApproval.bankId = this.bankId;
    internalBankAccountApproval.mainAccount = this.mainAccount;
    internalBankAccountApproval.category = this.category;
    internalBankAccountApproval.purpose = this.purpose;
    internalBankAccountApproval.currency = this.currency;
    internalBankAccountApproval.iBan = this.iBan;
    internalBankAccountApproval.accountNumber = this.accountNumber;
    internalBankAccountApproval.swiftCode = this.swiftCode;
    internalBankAccountApproval.isUpdatedNewAccount = this.isUpdatedNewAccount;
    internalBankAccountApproval.bankCategoryInfo = this.bankCategoryInfo;
    internalBankAccountApproval.currencyInfo = this.currencyInfo;
    internalBankAccountApproval.mainAccountInfo = this.mainAccountInfo;
    internalBankAccountApproval.bankInfo = this.bankInfo;
    internalBankAccountApproval.bankCategoryInfo = this.bankCategoryInfo;
    internalBankAccountApproval.internalBankAccountDTOs = this.internalBankAccountDTOs.map((ba: BankAccount) => {
      return (new BankAccount()).clone({id: ba.id, accountNumber: ba.accountNumber, isMergeAccount: ba.isMergeAccount, bankInfo: (new Bank()).clone(ba.bankInfo), bankCategoryInfo: (new Lookup()).clone(ba.bankCategoryInfo)})
    });
    internalBankAccountApproval.bankAccountExecutiveManagementDTOs = this.bankAccountExecutiveManagementDTOs.map(x => {
      let y = new NpoEmployee().clone(x);
      y.jobTitleInfo = (new Lookup()).clone(y.jobTitleInfo);
      return y;
    });

    return internalBankAccountApproval;
  }
}
