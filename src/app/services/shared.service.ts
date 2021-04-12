import {Injectable} from '@angular/core';
import {LangService} from './lang.service';
import {DialogService} from './dialog.service';
import {generateHtmlList} from '../helpers/utils';
import {ToastService} from './toast.service';
import {BulkResponseTypes} from '../types/types';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private langService: LangService,
              private toast: ToastService,
              private dialogService: DialogService) {
  }

  mapBulkResponseMessages(selectedRecords: any[], key: string, resultMap: { [key: number]: boolean } | { [key: string]: boolean }): Observable<BulkResponseTypes> {
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
      this.toast.success(this.langService.map.msg_delete_success);
      return of('SUCCESS');
    } else if (failedRecords.length === selectedRecords.length) {
      this.toast.error(this.langService.map.msg_delete_fail);
      return of('FAIL');
    } else {
      const listHtml = generateHtmlList(this.langService.map.msg_delete_success_except, failedRecords.map((item) => item.getName()));
      return this.dialogService.info(listHtml.outerHTML).onAfterClose$.pipe(
        map(res => {
          return 'PARTIAL_SUCCESS';
        })
      );
    }
  }
}
