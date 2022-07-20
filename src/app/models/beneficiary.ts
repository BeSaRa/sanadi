import {BaseModel} from './base-model';
import {FactoryService} from '../services/factory.service';
import {BeneficiaryService} from '../services/beneficiary.service';
import {Observable} from 'rxjs';
import {AdminResult} from './admin-result';
import {LangService} from '../services/lang.service';
import {CustomValidators} from '../validators/custom-validators';
import {Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {BeneficiarySaveStatus} from '../enums/beneficiary-save-status.enum';
import {Pair} from '../interfaces/pair';
import {SubventionRequest} from './subvention-request';
import {IMyDateModel} from 'angular-mydatepicker';
import {isValidValue} from '../helpers/utils';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {BeneficiaryObligation} from '@app/models/beneficiary-obligation';
import {BeneficiaryIncome} from '@app/models/beneficiary-income';
import {BenOccupationStatusEnum} from '@app/enums/status.enum';
import {InterceptModel} from '@decorators/intercept-model';
import {BeneficiaryInterceptor} from '@app/model-interceptors/beneficiary-interceptor';

@InterceptModel({
  receive: BeneficiaryInterceptor.receive,
  send: BeneficiaryInterceptor.send
})
export class Beneficiary extends BaseModel<Beneficiary, BeneficiaryService> {
  benNationality!: number;
  benPrimaryIdType!: number;
  benPrimaryIdNumber!: string;
  benPrimaryIdNationality!: number;
  benSecIdType!: string;
  benSecIdNationality!: number;
  benSecIdNumber!: string;
  residenceStatus!: number;
  residenceCountry!: number;
  gender!: number;
  dateOfBirth!: IMyDateModel;
  educationLevel!: number;
  phoneNumber1!: string;
  phoneNumber2!: string;
  email!: string;
  zone!: string;
  buildingName!: string;
  unit!: string;
  addressStatus!: number;
  addressStatusDateModified!: string;
  occuption!: string;
  employeer!: string;
  employeerAddress!: string;
  employeerMobileNumber!: string;
  employeerEmail!: string;
  govEmploymentStatus!: number;
  govEmploymentType!: number;
  govOccupationName!: string;
  govEmploymentStartDate!: string;
  govEmployementEndDate!: string;
  maritalStatus!: number;
  benWivesCount!: number;
  benDependentsCount!: number;
  benDependentsUnder18Count!: number;
  orgBranchId!: number;
  orgId!: number;
  orgUserId!: number;
  occuptionStatus!: number;
  streetName!: string;
  addressDescription!: string;
  benNotes!: string;
  familyCount!: number;
  benTotalDebts: number = 0;
  benTotalIncome: number = 0;
  isHandicapped: boolean = false;
  beneficiaryObligationSet: BeneficiaryObligation[] = [];
  beneficiaryIncomeSet: BeneficiaryIncome[] = [];
  employmentStatus!: boolean;
  benRequestorRelationType!: number;
  requestorName!: string;

  // not belong to the model
  service: BeneficiaryService;
  langService: LangService;

  OccuptionStatusInfo!: AdminResult;
  addressStatusInfo!: AdminResult;
  benPrimaryIdNationalityInfo!: AdminResult;
  benPrimaryIdTypeInfo!: AdminResult;
  benSecIdNationalityInfo!: AdminResult;
  benSecIdTypeInfo!: AdminResult;
  educationLevelInfo!: AdminResult;
  genderInfo!: AdminResult;
  govEmploymentStatusInfo!: AdminResult;
  maritalStatusInfo!: AdminResult;
  occuptionStatusInfo!: AdminResult;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  residenceCountryInfo!: AdminResult;
  residenceStatusInfo!: AdminResult;
  benNationalityInfo!: AdminResult;
  dateOfBirthString: string | undefined;

  searchFields: ISearchFieldsMap<Beneficiary> = {
    ...normalSearchFields(['arName', 'enName', 'benDependentsCount', 'benPrimaryIdNumber', 'benSecIdNumber']),
    ...infoSearchFields(['genderInfo', 'benNationalityInfo', 'benPrimaryIdTypeInfo', 'benSecIdTypeInfo'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('BeneficiaryService');
    this.langService = FactoryService.getService('LangService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (!this.benSecIdNumber) {
      delete this.searchFields.benSecIdTypeInfo;
      delete this.searchFields.benSecIdNumber;
    }
  }

  get orgAndBranchInfo() {
    if (!isValidValue(this.orgInfo.getName())) {
      return new AdminResult();
    }
    return AdminResult.createInstance({
      arName: this.orgInfo.arName + ' - ' + this.orgBranchInfo.arName,
      enName: this.orgInfo.enName + ' - ' + this.orgBranchInfo.enName,
    });
  }

  isBeneficiaryWorking(): boolean {
    return !!this.occuptionStatus && (this.occuptionStatus === BenOccupationStatusEnum.WORKING);
  }

  create(): Observable<Beneficiary> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<Beneficiary> {
    return this.id ? this.update() : this.create();
  }

  createWithValidate(validate: boolean = true): Observable<Pair<BeneficiarySaveStatus, Beneficiary>> {
    return this.service.createWithValidate(this, validate).pipe(map((value) => {
      if (value.second) {
        value.second = Object.assign(new Beneficiary, value.second);
      }
      return value;
    }));
  }

  saveWithValidate(validate: boolean = true, currentRequest: SubventionRequest | undefined): Observable<Pair<BeneficiarySaveStatus, Beneficiary>> {
    return currentRequest && currentRequest.id ? this.update().pipe(
      map(value => ({first: BeneficiarySaveStatus.SAVED, second: value}))
    ) : this.createWithValidate(validate);
  }

  update(): Observable<Beneficiary> {
    return this.service.update(this);
  }

  getPersonalFields(controls: boolean = false): any {
    const {
      benNationality,
      dateOfBirth,
      gender,
      enName,
      arName,
      benPrimaryIdNumber,
      benPrimaryIdType,
      benPrimaryIdNationality,
      phoneNumber1,
      employeer,
      benDependentsCount,
      educationLevel,
      maritalStatus,
      benSecIdNumber,
      benSecIdType,
      benSecIdNationality,
      benNotes,
      familyCount,
      occuptionStatus,
      occuption,
      employeerAddress,
      isHandicapped,
      benRequestorRelationType,
      requestorName
    } = this;

    return {
      benPrimaryIdType: controls ? [benPrimaryIdType, CustomValidators.required] : benPrimaryIdType,
      benPrimaryIdNumber: controls ? [benPrimaryIdNumber, CustomValidators.required] : benPrimaryIdNumber,
      benPrimaryIdNationality: controls ? [benPrimaryIdNationality, CustomValidators.required] : benPrimaryIdNationality,
      benSecIdType: controls ? [benSecIdType] : benSecIdType,
      benSecIdNumber: controls ? [benSecIdNumber] : benSecIdNumber,
      benSecIdNationality: controls ? [benSecIdNationality] : benSecIdNationality,
      benNationality: controls ? [benNationality, CustomValidators.required] : benNationality,
      dateOfBirth: controls ? [dateOfBirth, [CustomValidators.required, CustomValidators.maxDate(new Date())]] : dateOfBirth,
      gender: controls ? [gender, CustomValidators.required] : gender,
      enName: controls ? [enName, [CustomValidators.required,
        CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : enName,
      arName: controls ? [arName, [CustomValidators.required,
        CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : arName,
      phoneNumber1: controls ? [phoneNumber1, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phoneNumber1,
      employeer: controls ? [employeer, [CustomValidators.pattern('ENG_AR_ONLY'), CustomValidators.maxLength(100)]] : employeer,
      benDependentsCount: controls ? [benDependentsCount, [CustomValidators.required,
        CustomValidators.number, Validators.min(0), CustomValidators.maxLength(2)]] : benDependentsCount,
      educationLevel: controls ? [educationLevel, CustomValidators.required] : educationLevel,
      maritalStatus: controls ? [maritalStatus, CustomValidators.required] : maritalStatus,
      benNotes: controls ? [benNotes, [Validators.maxLength(3000)]] : benNotes,
      familyCount: controls ? [familyCount, [CustomValidators.required, CustomValidators.number, Validators.min(1)]] : familyCount,
      occuptionStatus: controls ? [occuptionStatus, CustomValidators.required] : occuptionStatus, //Employment Status
      occuption: controls ? [occuption, [CustomValidators.pattern('ENG_AR_ONLY'), CustomValidators.maxLength(100)]] : occuption, //Occupation
      employeerAddress: controls ? [employeerAddress, CustomValidators.maxLength(512)] : employeerAddress, //Work Place
      isHandicapped: controls ? [isHandicapped] : isHandicapped,
      benRequestorRelationType: controls ? [benRequestorRelationType, [CustomValidators.required]] : benRequestorRelationType,
      requestorName: controls ? [requestorName, [CustomValidators.required, CustomValidators.maxLength(100)]] : requestorName,
    };
  }

  getAddressFields(control: boolean = false): any {
    const {
      residenceCountry,
      addressDescription
    } = this;

    return {
      residenceCountry: control ? [residenceCountry, CustomValidators.required] : residenceCountry,
      addressDescription: control ? [addressDescription, [Validators.maxLength(3000)]] : addressDescription
    };
  }
}
