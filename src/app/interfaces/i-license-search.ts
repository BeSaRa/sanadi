import { FileNetModel } from '@app/models/FileNetModel';
import { Observable } from 'rxjs';
export interface ILicenseSearch<T extends FileNetModel<T>> {
  licenseSearchById(licenseId:string):Observable<T>;
}
