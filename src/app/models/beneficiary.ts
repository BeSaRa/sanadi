import {BaseModel} from './base-model';
import {FactoryService} from '../services/factory.service';
import {BeneficiaryService} from '../services/beneficiary.service';
import {Observable} from 'rxjs';
import {AdminResult} from './admin-result';
import {LangService} from '../services/lang.service';
import {CustomValidators} from '../validators/custom-validators';

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
      occuptionStatus,
      benSecIdNumber,
      benSecIdType
    } = this;

    return {
      benNationality: control ? [benNationality, CustomValidators.required] : benNationality,
      dateOfBirth: control ? [dateOfBirth, CustomValidators.required] : dateOfBirth,
      gender: control ? [gender, CustomValidators.required] : gender,
      enName: control ? [arName, CustomValidators.required] : enName,
      arName: control ? [arName, CustomValidators.required] : arName,
      benPrimaryIdNumber: control ? [benPrimaryIdNumber, CustomValidators.required] : benPrimaryIdNumber,
      benPrimaryIdType: control ? [benPrimaryIdType, CustomValidators.required] : benPrimaryIdType,
      phoneNumber1: control ? [phoneNumber1, CustomValidators.required] : phoneNumber1,
      employeer: control ? [employeer, CustomValidators.required] : employeer,
      benDependentsCount: control ? [benDependentsCount, CustomValidators.required] : benDependentsCount,
      educationLevel: control ? [educationLevel, CustomValidators.required] : educationLevel,
      maritalStatus: control ? [maritalStatus, CustomValidators.required] : maritalStatus,
      occuptionStatus: control ? [occuptionStatus, CustomValidators.required] : occuptionStatus,
      benSecIdNumber: control ? [benSecIdNumber] : benSecIdNumber,
      benSecIdType: control ? [benSecIdType] : benSecIdType
    };
  }

  getEmployerFields(controls: boolean): any {
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

  getAddressFields(control: boolean): any {
    const {
      residenceStatus,
      residenceCountry,
      unit,
      buildingName,
      zone,
      addressStatus,
      homePhoneNumber
    } = this;

    return {
      residenceCountry: control ? [residenceCountry, CustomValidators.required] : residenceCountry,
      unit: control ? [unit] : unit,
      buildingName: control ? [buildingName] : buildingName,
      zone: control ? [zone] : zone,
      // addressStatus: control ? [addressStatus] : addressStatus,
      // residenceStatus: control ? [residenceStatus , CustomValidators.required] : residenceStatus,
      homePhoneNumber: control ? [homePhoneNumber] : homePhoneNumber,
    };
  }
}
