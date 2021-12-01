import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Certificate} from '@app/models/certificate';

export class CertificateInterceptor implements IModelInterceptor<Certificate>{
  receive(model: Certificate): Certificate {
    return model;
  }

  send(model: Partial<Certificate>): Partial<Certificate> {
    return model;
  }
}
