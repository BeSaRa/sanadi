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

export class Beneficiary extends BaseModel<Beneficiary> {
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
  homePhoneNumber!: string;
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
  benIncome!: number;
  benExtraIncome!: number;
  benExtraIncomeSource!: string;
  maritalStatus!: number;
  benHouseRent!: number;
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
  benCategory!: number;
  totalInstalments!: number;
  totalDebts!: number;
  familyCount!: number;

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

  constructor() {
    super();
    this.service = FactoryService.getService('BeneficiaryService');
    this.langService = FactoryService.getService('LangService');
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

  getPersonalFields(control: boolean = false): any {
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
      benCategory,
      familyCount
    } = this;

    return {
      benPrimaryIdType: control ? [benPrimaryIdType, CustomValidators.required] : benPrimaryIdType,
      benPrimaryIdNumber: control ? [benPrimaryIdNumber, CustomValidators.required] : benPrimaryIdNumber,
      benPrimaryIdNationality: control ? [benPrimaryIdNationality, CustomValidators.required] : benPrimaryIdNationality,
      benSecIdType: control ? [benSecIdType] : benSecIdType,
      benSecIdNumber: control ? [benSecIdNumber] : benSecIdNumber,
      benSecIdNationality: control ? [benSecIdNationality] : benSecIdNationality,
      benNationality: control ? [benNationality, CustomValidators.required] : benNationality,
      dateOfBirth: control ? [dateOfBirth, [CustomValidators.required, CustomValidators.maxDate(new Date())]] : dateOfBirth,
      gender: control ? [gender, CustomValidators.required] : gender,
      enName: control ? [enName, [CustomValidators.required,
        CustomValidators.pattern('ENG_ONLY'),
        Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : enName,
      arName: control ? [arName, [CustomValidators.required,
        CustomValidators.pattern('AR_ONLY'),
        Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : arName,
      phoneNumber1: control ? [phoneNumber1, [CustomValidators.required,
        CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]] : phoneNumber1,
      employeer: control ? [employeer, [CustomValidators.pattern('ENG_AR_ONLY'), CustomValidators.maxLength(100)]] : employeer,
      benDependentsCount: control ? [benDependentsCount, [CustomValidators.required,
        CustomValidators.number, Validators.min(0), CustomValidators.maxLength(2)]] : benDependentsCount,
      educationLevel: control ? [educationLevel, CustomValidators.required] : educationLevel,
      maritalStatus: control ? [maritalStatus, CustomValidators.required] : maritalStatus,
      benNotes: control ? [benNotes, [Validators.maxLength(3000)]] : benNotes,
      benCategory: control ? [benCategory, CustomValidators.required] : benCategory,
      familyCount: control ? [familyCount, [CustomValidators.required, CustomValidators.number, Validators.min(1)]] : familyCount
    };
  }

  getEmployerFields(controls: boolean = false): any {
    const {
      occuptionStatus,
      occuption,
      employeerAddress,
      benIncome,
      benExtraIncome,
      benExtraIncomeSource,
      benHouseRent,
      totalInstalments,
      totalDebts
    } = this;

    return {
      occuptionStatus: controls ? [occuptionStatus, CustomValidators.required] : occuptionStatus,
      occuption: controls ? [occuption, CustomValidators.maxLength(100)] : occuption,
      employeerAddress: controls ? [employeerAddress, CustomValidators.maxLength(512)] : employeerAddress,
      benIncome: controls ? [benIncome, [CustomValidators.number, Validators.min(0)]] : benIncome,
      benExtraIncome: controls ? [benExtraIncome, [CustomValidators.number, Validators.min(0)]] : benExtraIncome,
      benExtraIncomeSource: controls ? [benExtraIncomeSource, [Validators.maxLength(100)]] : benExtraIncomeSource,
      benHouseRent: controls ? [benHouseRent, [CustomValidators.number, Validators.min(0)]] : benHouseRent,
      totalInstalments: controls ? [totalInstalments, [CustomValidators.number, Validators.min(1)]] : totalInstalments,
      totalDebts: controls ? [totalDebts, [CustomValidators.number, Validators.min(0)]] : totalDebts
    };
  }

  getAddressFields(control: boolean = false): any {
    const {
      residenceStatus,
      residenceCountry,
      unit,
      buildingName,
      zone,
      addressStatus,
      addressDescription,
      streetName,
      homePhoneNumber
    } = this;

    return {
      residenceCountry: control ? [residenceCountry, CustomValidators.required] : residenceCountry,
      streetName: control ? [streetName, [CustomValidators.number, CustomValidators.required, Validators.maxLength(20)]] : streetName,
      buildingName: control ? [buildingName, [CustomValidators.number, CustomValidators.required,
        Validators.maxLength(20)]] : buildingName,
      zone: control ? [zone, [CustomValidators.number, CustomValidators.required, Validators.maxLength(20)]] : zone,
      unit: control ? [unit, [CustomValidators.number, CustomValidators.maxLength(20)]] : unit,
      homePhoneNumber: control ? [homePhoneNumber, [CustomValidators.number,
        Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]] : homePhoneNumber,
      addressDescription: control ? [addressDescription, [Validators.maxLength(3000)]] : addressDescription
    };
  }
}
