import {SafeUrl} from '@angular/platform-browser';

export interface IBlobModel {
  blob: Blob;
  safeUrl: SafeUrl;

  isImage(): boolean;

  isPDF(): boolean;
}
