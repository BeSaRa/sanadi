import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {InternalDepartment} from '../models/internal-department';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {InternalDepartmentTypes} from '../enums/internal-department-types';
import {Generator} from '../decorators/generator';
import {InternalDepartmentInterceptor} from '../model-interceptors/internal-department-interceptor';

@Injectable({
  providedIn: 'root'
})
export class InternalDepartmentService extends BackendGenericService<InternalDepartment> {
  list!: InternalDepartment[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
  }

  @Generator(InternalDepartment, true, {property: 'rs'})
  private _loadDepartmentsByType(type: InternalDepartmentTypes): Observable<InternalDepartment[]> {
    return this.http.get<InternalDepartment[]>(this._getServiceURL() + '/type/' + type);
  }

  loadDepsByType(type: InternalDepartmentTypes): Observable<InternalDepartment[]> {
    return this._loadDepartmentsByType(type);
  }

  loadDepartments(): Observable<InternalDepartment[]> {
    return this.loadDepsByType(InternalDepartmentTypes.ADMINISTRATION);
  }

  loadSections(): Observable<InternalDepartment[]> {
    return this.loadDepsByType(InternalDepartmentTypes.SECTION);
  }

  loadOffices(): Observable<InternalDepartment[]> {
    return this.loadDepsByType(InternalDepartmentTypes.OFFICE);
  }

  loadCommittees(): Observable<InternalDepartment[]> {
    return this.loadDepsByType(InternalDepartmentTypes.COMMITTEE);
  }


  _getModel() {
    return InternalDepartment;
  }

  _getSendInterceptor() {
    return InternalDepartmentInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.INTERNAL_DEPARTMENT;
  }

  _getReceiveInterceptor() {
    return InternalDepartmentInterceptor.receive;
  }
}
