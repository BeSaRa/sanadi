import { Beneficiary } from '../models/beneficiary';
import { AdminResult } from '../models/admin-result';
import { DateUtils } from '@helpers/date-utils';
import { FactoryService } from '@app/services/factory.service';
import { BeneficiaryService } from '@app/services/beneficiary.service';
import { BeneficiaryObligation } from '@app/models/beneficiary-obligation';
import { BeneficiaryIncome } from '@app/models/beneficiary-income';
import { CommonUtils } from '@app/helpers/common-utils';
import { BeneficiaryFamilyMember } from '@models/beneficiary-family-member';

export class BeneficiaryInterceptor {
  receive(model: Beneficiary): Beneficiary {
    model.OccuptionStatusInfo = AdminResult.createInstance(model.OccuptionStatusInfo);
    model.addressStatusInfo = AdminResult.createInstance(model.addressStatusInfo);
    model.benPrimaryIdNationalityInfo = AdminResult.createInstance(model.benPrimaryIdNationalityInfo);
    model.benPrimaryIdTypeInfo = AdminResult.createInstance(model.benPrimaryIdTypeInfo);
    model.benSecIdNationalityInfo = AdminResult.createInstance(model.benSecIdNationalityInfo);
    model.benSecIdTypeInfo = AdminResult.createInstance(model.benSecIdTypeInfo);
    model.educationLevelInfo = AdminResult.createInstance(model.educationLevelInfo);
    model.genderInfo = AdminResult.createInstance(model.genderInfo);
    model.govEmploymentStatusInfo = AdminResult.createInstance(model.govEmploymentStatusInfo);
    model.govEmploymentTypeInfo = AdminResult.createInstance(model.govEmploymentTypeInfo);
    model.maritalStatusInfo = AdminResult.createInstance(model.maritalStatusInfo);
    model.occuptionStatusInfo = AdminResult.createInstance(model.occuptionStatusInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.residenceCityInfo = AdminResult.createInstance(model.residenceCityInfo);
    model.residenceStatusInfo = AdminResult.createInstance(model.residenceStatusInfo);
    model.benNationalityInfo = AdminResult.createInstance(model.benNationalityInfo);

    model.dateOfBirthString = DateUtils.getDateStringFromDate(model.dateOfBirth);
    model.dateOfBirth = DateUtils.changeDateToDatepicker(model.dateOfBirth);

    let beneficiaryService = FactoryService.getService<BeneficiaryService>('BeneficiaryService');
    model.beneficiaryObligationSet = model.beneficiaryObligationSet.map((x: any) => beneficiaryService.beneficiaryObligationInterceptor.receive(new BeneficiaryObligation().clone(x)));
    model.beneficiaryIncomeSet = model.beneficiaryIncomeSet.map((x: any) => beneficiaryService.beneficiaryIncomeInterceptor.receive(new BeneficiaryIncome().clone(x)));
    model.beneficiaryFamilyMemberSet = model.beneficiaryFamilyMemberSet
      .map((x: any) => beneficiaryService.beneficiaryFamilyMemberInterceptor.receive(new BeneficiaryFamilyMember().clone(x)));

    return model;
  }

  send(model: any): any {
    BeneficiaryInterceptor._deleteBeforeSend(model);

    model.dateOfBirth = !model.dateOfBirth ? model.dateOfBirth : DateUtils.changeDateFromDatepicker(model.dateOfBirth)?.toISOString();

    //if no secondary id type is selected, clear secondary id and nationality fields
    if (!CommonUtils.isValidValue(model.benSecIdType)) {
      model.benSecIdNationality = null;
      model.benSecIdNumber = null;
    }

    // trim the arName, enName, primary id number, secondary id number
    model.arName = !!model.arName ? ('' + model.arName).trim() : model.arName;
    model.enName = !!model.enName ? ('' + model.enName).trim() : model.enName;
    model.benPrimaryIdNumber = !!model.benPrimaryIdNumber ? ('' + model.benPrimaryIdNumber).trim() : model.benPrimaryIdNumber;
    model.benSecIdNumber = !!model.benSecIdNumber ? ('' + model.benSecIdNumber).trim() : model.benSecIdNumber;

    let beneficiaryService = FactoryService.getService<BeneficiaryService>('BeneficiaryService');
    model.beneficiaryObligationSet = model.beneficiaryObligationSet.map((x: BeneficiaryObligation) => {
      return beneficiaryService.beneficiaryObligationInterceptor.send(x) as BeneficiaryObligation;
    });
    model.beneficiaryIncomeSet = model.beneficiaryIncomeSet.map((x: BeneficiaryIncome) => {
      return beneficiaryService.beneficiaryIncomeInterceptor.send(x) as BeneficiaryIncome;
    });
    model.beneficiaryFamilyMemberSet = model.beneficiaryFamilyMemberSet.map((x: BeneficiaryFamilyMember) => {
      return beneficiaryService.beneficiaryFamilyMemberInterceptor.send(x) as BeneficiaryFamilyMember;
    });

    return model;
  }

  private static _deleteBeforeSend(model: Partial<Beneficiary> | any): void {
    delete model.langService;
    delete model.service;
    delete model.OccuptionStatusInfo;
    delete model.addressStatusInfo;
    delete model.benPrimaryIdNationalityInfo;
    delete model.benPrimaryIdTypeInfo;
    delete model.benSecIdNationalityInfo;
    delete model.benSecIdTypeInfo;
    delete model.educationLevelInfo;
    delete model.genderInfo;
    delete model.govEmploymentStatusInfo;
    delete model.govEmploymentTypeInfo;
    delete model.maritalStatusInfo;
    delete model.occuptionStatusInfo;
    delete model.orgInfo;
    delete model.orgUserInfo;
    delete model.residenceCityInfo;
    delete model.residenceStatusInfo;
    delete model.benNationalityInfo;
    delete model.dateOfBirthString;
  }
}
