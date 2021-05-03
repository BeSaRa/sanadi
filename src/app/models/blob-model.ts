import {IBlobModel} from '../interfaces/iblob-model';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

export class BlobModel implements IBlobModel {
  readonly url: string;
  safeUrl: SafeResourceUrl;

  constructor(public blob: Blob, domSanitizer: DomSanitizer) {
    this.url = URL.createObjectURL(blob);
    this.safeUrl = domSanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  isImage(): boolean {
    return !this.isPDF();
  }

  isPDF(): boolean {
    return this.blob.type === 'application/pdf';
  }

  dispose(): void {
    URL.revokeObjectURL(this.url);
  }
}
