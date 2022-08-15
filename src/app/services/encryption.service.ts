import {Injectable} from '@angular/core';
import {AES, MD5, enc} from 'crypto-js';
import {FactoryService} from './factory.service';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() {
    FactoryService.registerService('EncryptionService', this);
  }

  encrypt<T = any>(model: T): string {
    const randomPrivateKey = MD5(Math.random().toString()).toString();
    return AES.encrypt(JSON.stringify(model), randomPrivateKey).toString() + ':' + randomPrivateKey;
  }

  decrypt<T = any>(encryptedText: string | undefined): T {
    if (!encryptedText) {
      return null as unknown as T;
    }
    return JSON.parse(AES.decrypt((encryptedText.split(':').shift() + ''), (encryptedText.split(':').pop() + '')).toString(enc.Utf8));
  }
}
