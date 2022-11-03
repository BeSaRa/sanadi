import { IBlobModel } from '../interfaces/iblob-model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileMimeTypesEnum } from '@app/enums/file-extension-mime-types-icons.enum';

export class BlobModel implements IBlobModel {
  readonly url: string;
  safeUrl: SafeResourceUrl;

  constructor(public blob: Blob, domSanitizer: DomSanitizer) {
    this.url = URL.createObjectURL(blob);
    this.safeUrl = domSanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  toFile(): File {
    const fileName = `file-${new Date()}`;
    return new File([this.blob], fileName, {
      lastModified: new Date().getTime(),
      type: this.blob.type
    });
  }

  isImage(): boolean {
    return !this.isPDF();
  }

  isPDF(): boolean {
    return this.blob.type === FileMimeTypesEnum.PDF;
  }

  dispose(): void {
    URL.revokeObjectURL(this.url);
  }
}
