import { BaseModel } from './base-model';
import { Observable } from 'rxjs';
import { FactoryService } from '@services/factory.service';
import { AidLookupService } from '@services/aid-lookup.service';
import { INames } from '@contracts/i-names';
import { LangService } from '@services/lang.service';
import { Lookup } from './lookup';
import { searchFunctionType } from '../types/types';
import { DialogRef } from '../shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { Validators } from '@angular/forms';
import { AdminResult } from '@app/models/admin-result';
import { AidLookupInterceptor } from "@app/model-interceptors/aid-lookup-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import {AidLookupStatusEnum} from '@app/enums/status.enum';

const { send, receive } = new AidLookupInterceptor();

@InterceptModel({ send, receive })
export class AidLookup extends BaseModel<AidLookup, AidLookupService> {
  aidCode!: string;
  category: number | undefined;
  status: number | undefined = AidLookupStatusEnum.ACTIVE;
  statusDateModified: number | undefined;
  aidType: number | undefined;
  aidTypeInfo: Lookup | undefined;
  parent: number | undefined;
  parentInfo: any | undefined;

  service: AidLookupService;
  private langService: LangService;
  statusInfo!: Lookup;
  statusDateModifiedString!: string;

  searchFields: { [key: string]: searchFunctionType | string } = {
    aidCode: 'aidCode',
    arName: 'arName',
    enName: 'enName',
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
    statusModifiedDate: 'statusDateModifiedString'
  };

  constructor() {
    super();
    this.service = FactoryService.getService('AidLookupService');
    this.langService = FactoryService.getService('LangService');
  }

  buildForm(controls?: boolean) {
    const {
      arName,
      enName,
      aidCode,
      aidType,
      parent,
      statusDateModified
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      aidCode: controls ? [aidCode, [CustomValidators.required, CustomValidators.number, Validators.maxLength(50)]] : aidCode,
      aidType: controls ? [aidType, [CustomValidators.required]] : aidType,
      parent: controls ? [parent] : parent,
      statusDateModified: controls ? [statusDateModified] : statusDateModified
    }
  }

  create(): Observable<AidLookup> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  deactivate(): Observable<boolean> {
    return this.service.deactivate(this.id);
  }

  save(): Observable<AidLookup> {
    return this.id ? this.service.update(this) : this.service.create(this);
  }

  update(): Observable<AidLookup> {
    return this.service.update(this);
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  isActive(): boolean {
    return Number(this.status) === AidLookupStatusEnum.ACTIVE;
  }

  convertToAdminResult(): AdminResult {
    return AdminResult.createInstance({arName: this.arName, enName: this.enName, id: this.id, parent: this.parent, status: this.status, disabled: !this.isActive()});
  }
}
