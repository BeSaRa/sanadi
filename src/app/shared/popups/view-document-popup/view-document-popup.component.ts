import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {FileNetDocument} from '../../../models/file-net-document';
import {BlobModel} from '../../../models/blob-model';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-view-document-popup',
  templateUrl: './view-document-popup.component.html',
  styleUrls: ['./view-document-popup.component.scss']
})
export class ViewDocumentPopupComponent implements OnInit, OnDestroy {
  model: FileNetDocument;
  blob: BlobModel;
  @ViewChild('iframe') iframe!: ElementRef<HTMLIFrameElement>;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: { model: FileNetDocument, blob: BlobModel }, @Inject(DOCUMENT) private document: HTMLDocument) {
    this.model = data.model;
    this.blob = data.blob;
  }

  ngOnInit(): void {
  }

  fullscreen() {
    this.iframe.nativeElement.requestFullscreen().then();
  }

  ngOnDestroy(): void {
    this.blob.dispose();
  }
}
