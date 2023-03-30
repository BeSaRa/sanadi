import {BaseModel} from './base-model';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {Observable} from 'rxjs';
import {INames} from '@contracts/i-names';
import {searchFunctionType} from '../types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {Validators} from '@angular/forms';

export class Localization extends BaseModel<Localization, LangService> {
  localizationKey: string | undefined;
  module: number = 0;
  service: LangService;
  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    localizationKey: 'localizationKey'
  };

  constructor() {
    super();
    this.service = FactoryService.getService('LangService');
  }

  create(): Observable<Localization> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<Localization> {
    return this.id ? this.service.update(this) : this.service.create(this);
  }

  update(): Observable<Localization> {
    return this.service.update(this);
  }

  getName(): string {
    return this[(this.service.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const {arName, enName, localizationKey} = this;
    return {
      arName: controls ? [arName, [CustomValidators.required, CustomValidators.maxLength(1000)]] : arName,
      enName: controls ? [enName, [CustomValidators.required, CustomValidators.maxLength(1000)]] : enName,
      localizationKey: controls ? [{
        value: localizationKey,
        disabled: !!this.id
        // disabled: false
      }, [CustomValidators.required, Validators.minLength(2), Validators.maxLength(150)]] : localizationKey,
    }
  }
}
