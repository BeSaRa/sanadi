import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { BlobModel } from '@app/models/blob-model';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LangService } from '@app/services/lang.service';
import { BaseModel } from '@app/models/base-model';
import { CrudGenericService } from "@app/generics/crud-generic-service";

@Component({
  selector: 'trainer-cv-popup',
  templateUrl: './view-document-popup.component.html',
  styleUrls: ['./view-document-popup.component.scss']
})
export class ViewDocumentPopupComponent<T, S extends CrudGenericService<T>> implements OnInit {
  blob!: BlobModel;
  model!: BaseModel<T, S>;
  resumePath!: SafeResourceUrl;
  @ViewChild('iframe') iframe!: ElementRef<HTMLIFrameElement>;
  show = false;
  titleKey!: string;
  getNameFunc!: () => string;
  hasGetNameFunc = false;
  modelPropName?: string;
  titleHasPlaceHolder = false;
  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<BaseModel<T, S>>,
              public lang: LangService) {
    this.blob = data.blob;
    this.model = data.model;
    this.titleKey = data.titleKey;
    this.getNameFunc = data.getNameFunc;
    this.modelPropName = data.modelPropName;
    this.hasGetNameFunc = data.hasGetNameFunc;
    this.titleHasPlaceHolder = data.titleHasPlaceHolder;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.show = true;
    }, 300);
    this.setCurrentResume();
  }

  get popupTitle() {
    // @ts-ignore
    if(this.titleHasPlaceHolder) {
      if(this.getNameFunc) {
        // @ts-ignore
        return this.lang.map[this.titleKey].change({x: this.getNameFunc()})
      } else {
        // @ts-ignore
        return this.lang.map[this.titleKey].change({x: this.model[this.modelPropName]})
      }
    } else {
      // @ts-ignore
      return this.lang.map[this.titleKey];
    }
  }

  setCurrentResume() {
    this.resumePath = this.blob.safeUrl;
  }

  fullscreen() {
    this.iframe.nativeElement.requestFullscreen().then();
  }

  ngOnDestroy(): void {

  }
}
