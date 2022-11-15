import {Injectable} from '@angular/core';
import {LookupService} from './lookup.service';
import {FactoryService} from './factory.service';
import {isObservable, of} from 'rxjs';
import {InternalDepartmentService} from './internal-department.service';
import {CountryService} from './country.service';
import {CharityOrganizationService} from './charity-organization.service';
import {ProfileService} from '@services/profile.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicOptionsService {
  private readonly loader: any = {};

  constructor(private lookupService: LookupService,
              private internalDepartmentService: InternalDepartmentService,
              private profileService: ProfileService,
              private countryService: CountryService,
              private charityService: CharityOrganizationService) {
    FactoryService.registerService('DynamicOptionsService', this);
    this.loader = {
      lookup: lookupService.listByCategory,
      department: internalDepartmentService,
      organization: profileService,
      country: countryService,
      charity: charityService
    };
  }

  load(loaderWithCaller: string) {
    let [loader, method] = loaderWithCaller.split('.');
    let result = typeof this.loader[loader][method] === 'function' ? this.loader[loader][method]() : this.loader[loader][method];
    return isObservable(result) ? result : of(result);
  }


}
