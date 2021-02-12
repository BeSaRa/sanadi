import {BaseModel} from './base-model';
import {FactoryService} from '../services/factory.service';
import {BeneficiaryService} from '../services/beneficiary.service';
import {Observable} from 'rxjs';
import {AdminResult} from './admin-result';
import {LangService} from '../services/lang.service';
import {CustomValidators} from '../validators/custom-validators';
import {Validators} from '@angular/forms';

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
  dateOfBirth!: string;
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
      phoneNumber1,
      employeer,
      benDependentsCount,
      educationLevel,
      maritalStatus,
      benSecIdNumber,
      benSecIdType,
      benNotes,
      benCategory
    } = this;

    return {
      benNationality: control ? [benNationality, CustomValidators.required] : benNationality,
      dateOfBirth: control ? [dateOfBirth, CustomValidators.required] : dateOfBirth,
      gender: control ? [gender, CustomValidators.required] : gender,
      enName: control ? [enName, [CustomValidators.required,
        CustomValidators.pattern('ENG'),
        Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : enName,
      arName: control ? [arName, [CustomValidators.required,
        CustomValidators.pattern('AR'),
        Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : arName,
      benPrimaryIdNumber: control ? [benPrimaryIdNumber, CustomValidators.required] : benPrimaryIdNumber,
      benPrimaryIdType: control ? [benPrimaryIdType, CustomValidators.required] : benPrimaryIdType,
      phoneNumber1: control ? [phoneNumber1, [CustomValidators.required,
        CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]] : phoneNumber1,
      employeer: control ? [employeer, CustomValidators.required] : employeer,
      benDependentsCount: control ? [benDependentsCount, CustomValidators.required] : benDependentsCount,
      educationLevel: control ? [educationLevel, CustomValidators.required] : educationLevel,
      maritalStatus: control ? [maritalStatus, CustomValidators.required] : maritalStatus,
      benSecIdNumber: control ? [benSecIdNumber] : benSecIdNumber,
      benSecIdType: control ? [benSecIdType] : benSecIdType,
      benNotes: control ? [benNotes] : benNotes,
      benCategory: control ? [benCategory, CustomValidators.required] : benCategory
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
      benHouseRent
    } = this;

    return {
      occuptionStatus: controls ? [occuptionStatus, CustomValidators.required] : occuptionStatus,
      occuption: controls ? [occuption] : occuption,
      employeerAddress: controls ? [employeerAddress] : employeerAddress,
      benIncome: controls ? [benIncome] : benIncome,
      benExtraIncome: controls ? [benExtraIncome] : benExtraIncome,
      benExtraIncomeSource: controls ? [benExtraIncomeSource] : benExtraIncomeSource,
      benHouseRent: controls ? [benHouseRent] : benHouseRent
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
      streetName: control ? [streetName, CustomValidators.required] : streetName,
      buildingName: control ? [buildingName, CustomValidators.required] : buildingName,
      zone: control ? [zone, CustomValidators.required] : zone,
      unit: control ? [unit] : unit,
      homePhoneNumber: control ? [homePhoneNumber] : homePhoneNumber,
      addressDescription: control ? [addressDescription] : addressDescription,
      // residenceStatus: control ? [residenceStatus , CustomValidators.required] : residenceStatus,
      // addressStatus: control ? [addressStatus] : addressStatus,
    };
  }
}
