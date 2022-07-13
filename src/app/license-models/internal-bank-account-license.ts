import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';
import {AdminResult} from '@app/models/admin-result';
import {Lookup} from '@app/models/lookup';
import {BankAccount} from '@app/models/bank-account';
import {Bank} from '@app/models/bank';

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
    internalBankAccountApproval.internalBankAccountDTOs = this.internalBankAccountDTOs.map((ba: BankAccount) => {
      return (new BankAccount()).clone({id: ba.id, accountNumber: ba.accountNumber, bankInfo: (new Bank()).clone(ba.bankInfo)})
    });
    internalBankAccountApproval.bankAccountExecutiveManagementDTOs = this.bankAccountExecutiveManagementDTOs.map(x => {
      x.jobTitleInfo = (new Lookup()).clone(x);
      return x;
    });

    return internalBankAccountApproval;
  }
}
