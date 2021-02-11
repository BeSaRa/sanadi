import {Injectable} from '@angular/core';
import {CookieOptions, CookieService, ICookieService} from 'ngx-cookie';
import {EncryptionService} from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class ECookieService implements ICookieService {

  constructor(private service: CookieService, private encryptionService: EncryptionService) {

  }

  get(key: string): string {
    return this.service.get(key);
  }

  getAll(): object {
    return this.service.getAll();
  }

  getObject(key: string): object | undefined {
    return this.service.getObject(key);
  }

  hasKey(key: string): boolean {
    return this.service.hasKey(key);
  }

  put(key: string, value: string, options?: CookieOptions): void {
    return this.service.put(key, value, options);
  }

  putObject(key: string, value: object, options?: CookieOptions): void {
    return this.service.putObject(key, value, options);
  }

  remove(key: string, options?: CookieOptions): void {
    return this.service.remove(key, options);
  }

  removeAll(options?: CookieOptions): void {
    this.service.removeAll(options);
  }

  putE(key: string, value: string, options?: CookieOptions): void {
    this.put(key, this.encryptionService.encrypt(value), options);
  }

  getE(key: string): string {
    return this.encryptionService.decrypt(this.get(key));
  }

  putEObject(key: string, value: object, options?: CookieOptions): void {
    return this.put(key, this.encryptionService.encrypt(value), options);
  }

  getEObject(key: string): object | undefined {
    return this.encryptionService.decrypt(this.get(key));
  }
}
