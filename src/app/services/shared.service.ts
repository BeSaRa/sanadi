import {Injectable} from '@angular/core';
import {LangService} from './lang.service';
import {DialogService} from './dialog.service';
import {generateHtmlList} from '../helpers/utils';
import {ToastService} from './toast.service';
import {BulkOperationTypes, DeleteBulkResult} from '../types/types';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {BlobModel} from '@app/models/blob-model';
import {ViewDocumentPopupComponent} from '@app/shared/popups/view-document-popup/view-document-popup.component';
import {DialogRef} from '@app/shared/models/dialog-ref';

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
  }

  mapBulkResponseMessages<T = any>(selectedRecords: T[], key: string, resultMap: { [p: number]: boolean } | { [p: string]: boolean }, operation: BulkOperationTypes = 'DELETE'): Observable<DeleteBulkResult<T>> {
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
      this.toast.success(this.bulkMessagesMap[operation]);
      return of({result: 'SUCCESS', success: selectedRecords, fails: []});
    } else if (failedRecords.length === selectedRecords.length) {
      // @ts-ignore
      this.toast.error(this.bulkMessagesMap[operation.toString() + '_FAIL']);
      return of({result: 'FAIL', fails: selectedRecords, success: []});
    } else {
      // @ts-ignore
      const listHtml = generateHtmlList(this.bulkMessagesMap[operation + '_PARTIAL'], failedRecords.map((item) => item.getName()));
      const failsIds = failedRecords.map(item => item[key]);
      return this.dialogService.info(listHtml.outerHTML).onAfterClose$.pipe(
        map(res => {
          return {
            result: 'PARTIAL_SUCCESS',
            fails: failedRecords,
            success: selectedRecords.filter(item => !failsIds.includes(item[key as keyof T]))
          };
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

}
