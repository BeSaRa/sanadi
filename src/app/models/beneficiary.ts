import { BaseModel } from './base-model';
import { FactoryService } from '@services/factory.service';
import { BeneficiaryService } from '@services/beneficiary.service';
import { Observable } from 'rxjs';
import { AdminResult } from './admin-result';
import { LangService } from '@services/lang.service';
import { CustomValidators } from '../validators/custom-validators';
import { Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { BeneficiarySaveStatus } from '../enums/beneficiary-save-status.enum';
import { Pair } from '@contracts/pair';
import { SubventionRequest } from './subvention-request';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { isValidValue } from '@helpers/utils';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { BeneficiaryObligation } from '@app/models/beneficiary-obligation';
import { BeneficiaryIncome } from '@app/models/beneficiary-income';
import { BenOccupationStatusEnum } from '@app/enums/status.enum';
import { InterceptModel } from '@decorators/intercept-model';
import { BeneficiaryInterceptor } from '@app/model-interceptors/beneficiary-interceptor';
import {BeneficiaryRequesterRelationTypes} from '@app/enums/beneficiary-requester-relation-types';

const { send, receive } = new BeneficiaryInterceptor()

@InterceptModel({
  receive,
  send
})
export class Beneficiary extends BaseModel<Beneficiary, BeneficiaryService> {
  arNameSrc!: string;
  benNationality!: number;
  benPrimaryIdType!: number;
  benPrimaryIdNumber!: string;
  benPrimaryIdNationality!: number;
  benSecIdType!: string;
  benSecIdNationality!: number;
  benSecIdNumber!: string;
  residenceStatus!: number;
  benGUID!: number;
  residenceCity!: number;
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
  occuptionStatus!: number;
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
  orgId!: number;
  orgUserId!: number;
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
  benRequestorRelationType: number = BeneficiaryRequesterRelationTypes.SAME_AS_REQUESTER;
  requestorName!: string;
  requestorIdType!: number;
  requestorIdNumber!: string;
  requestorIdNationality!: number;
  requestorPhoneNumber!: string;
  status!: number;
  statusDateModified!: string;
  expiryDate!: string|IMyDateModel;

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
  govEmploymentTypeInfo!: AdminResult;
  maritalStatusInfo!: AdminResult;
  occuptionStatusInfo!: AdminResult;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  residenceCityInfo!: AdminResult;
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

  createWithValidate(validate: boolean = true, validateMoph: boolean = true): Observable<Pair<BeneficiarySaveStatus, Beneficiary>> {
    return this.service.createWithValidate(this, validate, validateMoph).pipe(map((value) => {
      if (value.second) {
        value.second = Object.assign(new Beneficiary, value.second);
      }
      return value;
    }));
  }

  saveWithValidate(validate: boolean = true, currentRequest: SubventionRequest | undefined, validateMoph: boolean = true): Observable<Pair<BeneficiarySaveStatus, Beneficiary>> {
    return currentRequest && currentRequest.id ? this.update().pipe(
      map(value => ({ first: BeneficiarySaveStatus.SAVED, second: value }))
    ) : this.createWithValidate(validate, validateMoph);
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
      expiryDate,
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
      requestorName,
      requestorIdType,
      requestorIdNumber,
      requestorIdNationality,
      requestorPhoneNumber
    } = this;

    return {
      benPrimaryIdType: controls ? [benPrimaryIdType, CustomValidators.required] : benPrimaryIdType,
      benPrimaryIdNumber: controls ? [benPrimaryIdNumber, CustomValidators.required] : benPrimaryIdNumber,
      benPrimaryIdNationality: controls ? [benPrimaryIdNationality, [CustomValidators.required, CustomValidators.maxDate(new Date())]] : benPrimaryIdNationality,
      expiryDate: controls ? [expiryDate] : expiryDate,
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
      occuption: controls ? [occuption, [CustomValidators.maxLength(200)]] : occuption, //Occupation
      employeerAddress: controls ? [employeerAddress, CustomValidators.maxLength(200)] : employeerAddress, //Work Place
      isHandicapped: controls ? [isHandicapped] : isHandicapped,
      benRequestorRelationType: controls ? [benRequestorRelationType, [CustomValidators.required]] : benRequestorRelationType,
      requestorName: controls ? [requestorName, [CustomValidators.required, CustomValidators.maxLength(100)]] : requestorName,
      requestorIdType: controls ? [requestorIdType, [CustomValidators.required]] : requestorIdType,
      requestorIdNumber: controls ? [requestorIdNumber, CustomValidators.required] : requestorIdNumber,
      requestorIdNationality: controls ? [requestorIdNationality, CustomValidators.required] : requestorIdNationality,
      requestorPhoneNumber: controls ? [requestorPhoneNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : requestorPhoneNumber
    };
  }

  getAddressFields(control: boolean = false): any {
    const {
      residenceCity,
      addressDescription
    } = this;

    return {
      residenceCity: control ? [residenceCity, CustomValidators.required] : residenceCity,
      addressDescription: control ? [addressDescription, [Validators.maxLength(3000)]] : addressDescription
    };
  }
}
