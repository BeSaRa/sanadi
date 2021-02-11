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

  encrypt(model: any): string {
    const randomPrivateKey = MD5(Math.random().toString()).toString();
    return AES.encrypt(JSON.stringify(model), randomPrivateKey).toString() + ':' + randomPrivateKey;
  }

  decrypt(encryptedText: string): any {
    if (!encryptedText) {
      return null;
    }
    return JSON.parse(AES.decrypt((encryptedText.split(':').shift() + ''), (encryptedText.split(':').pop() + '')).toString(enc.Utf8));
  }
}
