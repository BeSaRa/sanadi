import {Injectable} from '@angular/core';
import {LookupService} from './lookup.service';
import {FactoryService} from './factory.service';
import {isObservable, of} from 'rxjs';
import {InternalDepartmentService} from './internal-department.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicOptionsService {
  private readonly loader: any = {};

  constructor(private lookupService: LookupService, private internalDepartmentService: InternalDepartmentService) {
    FactoryService.registerService('DynamicOptionsService', this);
    this.loader = {
      lookup: lookupService.listByCategory,
      internalDepartmentService: internalDepartmentService
    };
  }

  load(methodWithLoader: string) {
    let [loader, method] = methodWithLoader.split('.');
    let result = typeof this.loader[loader][method] === 'function' ? this.loader[loader][method]() : this.loader[loader][method];
    return isObservable(result) ? result : of(result);
  }


}
