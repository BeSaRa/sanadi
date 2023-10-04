import {Injectable} from '@angular/core';
import {LangService} from './lang.service';
import {DialogService} from './dialog.service';
import {generateHtmlList} from '@helpers/utils';
import {ToastService} from './toast.service';
import {BulkOperationTypes, DeleteBulkResult} from '../types/types';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {BlobModel} from '@app/models/blob-model';
import {ViewDocumentPopupComponent} from '@app/shared/popups/view-document-popup/view-document-popup.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FileExtensionsEnum, FileMimeTypesEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {UploadFilePopupComponent} from "@app/shared/popups/upload-file-popup/upload-file-popup.component";
import {ILanguageKeys} from "@contracts/i-language-keys";

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private langService: LangService,
              private toast: ToastService,
              private dialogService: DialogService) {
  }


  private bulkMessagesMap = {
    SAVE: this.langService.map.msg_added_successfully,
    SAVE_PARTIAL: this.langService.map.msg_save_success_except,
    SAVE_FAIL: this.langService.map.msg_save_fail,
    DELETE: this.langService.map.msg_delete_success,
    DELETE_PARTIAL: this.langService.map.msg_delete_success_except,
    DELETE_FAIL: this.langService.map.msg_delete_fail,
    UPDATE: this.langService.map.msg_update_success,
    UPDATE_PARTIAL: this.langService.map.msg_update_success_except,
    UPDATE_FAIL: this.langService.map.msg_update_fail
  };

  mapBulkResponseMessages<T = any>(selectedRecords: T[], key: string, resultMap: { [p: number]: boolean } | { [p: string]: boolean }, operation: BulkOperationTypes = 'DELETE', skipMessage: boolean = false): Observable<DeleteBulkResult<T>> {
    const failedRecords: any[] = [];
    // @ts-ignore
    resultMap = resultMap.hasOwnProperty('rs') ? resultMap.rs : resultMap;
    for (const item of selectedRecords) {
      // @ts-ignore
      if (resultMap.hasOwnProperty(item[key]) && !resultMap[item[key]]) {
        failedRecords.push(item);
      }
    }
    if (failedRecords.length === 0) {
      !skipMessage && this.toast.success(this.bulkMessagesMap[operation]);
      return of({result: 'SUCCESS', success: selectedRecords, fails: []});
    } else if (failedRecords.length === selectedRecords.length) {
      // @ts-ignore
      !skipMessage && this.toast.error(this.bulkMessagesMap[operation.toString() + '_FAIL']);
      return of({result: 'FAIL', fails: selectedRecords, success: []});
    } else {
      const failsIds = failedRecords.map(item => item[key]);
      const finalResult: DeleteBulkResult<T> = {
        result: 'PARTIAL_SUCCESS',
        fails: failedRecords,
        success: selectedRecords.filter(item => !failsIds.includes(item[key as keyof T]))
      };
      if (skipMessage) {
        return of(finalResult);
      }
      // @ts-ignore
      const listHtml = generateHtmlList(this.bulkMessagesMap[operation + '_PARTIAL'], failedRecords.map((item) => item.getName()));
      return this.dialogService.info(listHtml.outerHTML).onAfterClose$.pipe(
        map(res => {
          return finalResult;
        })
      );
    }
  }

  openViewContentDialog(blobFile: BlobModel, data: any): DialogRef | Observable<boolean> {
    if (blobFile.blob.type === 'error') {
      console.log('INVALID_CONTENT');
      return of(false);
    }
    return this.dialogService.show(ViewDocumentPopupComponent, {
      model: data,
      blob: blobFile
    }, {
      escToClose: true
    });
  }

  downloadFileToSystem(data: Blob, fileNameWithoutExtension: string = '', extension: string = ''): void {
    if (data.type === 'error' || data.size === 0) {
      this.toast.info(this.langService.map.msg_corrupt_invalid_file);
    }
    fileNameWithoutExtension = fileNameWithoutExtension || ('download-' + new Date().valueOf());
    extension = extension || SharedService._getDownloadExtensionByMimeType(data.type);

    const url = URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = URL.createObjectURL(data);
    a.download = fileNameWithoutExtension + extension;
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
  }

  private static _getDownloadExtensionByMimeType(mimeType: string) {
    // @ts-ignore
    const extensionName: string = Object.keys(FileMimeTypesEnum)[Object.values(FileMimeTypesEnum).indexOf(mimeType)];
    return FileExtensionsEnum[extensionName as keyof typeof FileExtensionsEnum] || undefined;
  }

  openFileUploaderDialog(data: {title: keyof ILanguageKeys, label: keyof ILanguageKeys, required: boolean, extensions: FileExtensionsEnum[]}): DialogRef {
    return this.dialogService.show(UploadFilePopupComponent, data);
  }
}
