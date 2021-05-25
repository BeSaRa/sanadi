import {Injectable} from '@angular/core';
import {ConfigurationService} from './configuration.service';
import {Localization} from '../models/localization';
import {LangService} from './lang.service';
import {ILanguageKeys} from '../interfaces/i-language-keys';

@Injectable({
  providedIn: 'root'
})
export class EServiceListService {
  services: Map<number, Localization> = new Map<number, Localization>();

  constructor(private config: ConfigurationService, private lang: LangService) {
    this.prepareServiceList();
  }

  prepareServiceList(): void {
    this.services.clear();
    Object.keys(this.config.CONFIG.E_SERVICES_LIST).forEach((key: string) => {
      let local = this.lang.getLocalByKey(this.config.CONFIG.E_SERVICES_LIST[Number(key)] as unknown as keyof ILanguageKeys);
      this.services.set(Number(key), local);
    });
  }

  getServiceName(serviceNumber: number): string | undefined {
    return this.services.has(serviceNumber) ? this.services.get(serviceNumber)?.getName() : '';
  }
}
