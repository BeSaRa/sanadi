import { BaseModel } from '@app/models/base-model';
import { TrainerService } from '@app/services/trainer.service';
import { FactoryService } from '@app/services/factory.service';
import { INames } from '@app/interfaces/i-names';
import { LangService } from '@app/services/lang.service';
import {ISearchFieldsMap} from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable } from 'rxjs';
import { BlobModel } from '@app/models/blob-model';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Lookup } from '@app/models/lookup';
import { InterceptModel } from "@decorators/intercept-model";
import { TrainerInterceptor } from "@app/model-interceptors/trainer-interceptor";
import {normalSearchFields} from '@helpers/normal-search-fields';

const { receive, send } = new TrainerInterceptor()

@InterceptModel({
  receive, send
})
export class Trainer extends BaseModel<Trainer, TrainerService> {
  specialization!: string;
  jobTitle!: string;
  langList!: string;
  langListInfo!: Lookup[];
  langListArr: number[] = [];
  nationality!: number;
  nationalityInfo!: Lookup;
  email!: string;
  phoneNumber!: string;
  address!: string;
  organizationUnit!: string;
  trainerCV!: {vsId: string};

  service: TrainerService;
  langService: LangService;
  searchFields: ISearchFieldsMap<Trainer> = {
    ...normalSearchFields(['arName', 'enName', 'specialization', 'jobTitle']),
    /*...infoSearchFields(['nationalityInfo']),
    trainingLanguages: text => !this.langListInfo || this.langListInfo.length == 0 ? false : this.langListInfo.some(lang => lang.getName().toLowerCase().indexOf(text.toLowerCase()) !== -1)*/
  };

  constructor() {
    super();
    this.service = FactoryService.getService('TrainerService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      specialization,
      jobTitle,
      email,
      phoneNumber,
      nationality,
      langListArr,
      organizationUnit,
      address
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      specialization: controls ? [specialization, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)
      ]] : specialization,
      jobTitle: controls ? [jobTitle, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)
      ]] : jobTitle,
      email: controls ? [email, [
        CustomValidators.required,
        ...CustomValidators.commonValidations.email
      ]] : email,
      phoneNumber: controls ? [phoneNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phoneNumber,
      nationality: controls ? [nationality, [
        CustomValidators.required
      ]] : nationality,
      langListArr: controls ? [langListArr, [
        CustomValidators.requiredArray
      ]] : langListArr,
      organizationUnit: controls ? [organizationUnit, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)
      ]] : organizationUnit,
      address: controls ? [address, [
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)
      ]] : address,
    }
  }

  uploadResume(file: File, documentTitle: string): Observable<string> {
    return this.service.uploadResume(this.id, documentTitle, file);
  }

  getResume(): Observable<BlobModel> {
    return this.service.getResume(this.trainerCV.vsId);
  }

  viewResume(): Observable<DialogRef> {
    return this.service.viewResumeDialog(this);
  }
}
