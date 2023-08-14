import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {iif, Observable, of} from 'rxjs';
import {CaseModel} from "@app/models/case-model";
import {InboxService} from "@app/services/inbox.service";
import {EncryptionService} from "@app/services/encryption.service";
import {INavigatedItem} from "@app/interfaces/inavigated-item";
import {map, switchMap} from "rxjs/operators";
import {OpenFrom} from "@app/enums/open-from.enum";
import {IOpenedInfo} from "@app/interfaces/i-opened-info";
import {ChecklistService} from "@app/services/checklist.service";

@Injectable({
  providedIn: 'root'
})
export class ServiceItemOldResolver implements Resolve<IOpenedInfo | null> {
  private itemKey: string = 'item';
  private route!: ActivatedRouteSnapshot;
  private info?: INavigatedItem;

  constructor(private inboxService: InboxService,
              private checklistService: ChecklistService,
              private encrypt: EncryptionService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IOpenedInfo | null> {
    this.route = route;
    const item = this.getItem();
    if (item === null) {
      return of(null);
    }
    // decrypt information
    try {
      this.info = this.encrypt.decrypt<INavigatedItem>(item);
    } catch (e) {
      // if there is error in decryption return null
      console.log('error in decryption');
      return of(null)
    }
    const {caseId, caseType, taskId, openFrom} = this.info;
    if (!caseId || !caseType) { // if we have missing needed properties while decrypt the info return null
      console.log('missing info');
      return of(null);
    }
    const service = this.inboxService.getService(caseType);
    return of(openFrom)
      .pipe(switchMap(() => iif(() => openFrom === OpenFrom.SEARCH, service.getById(caseId), service.getTask(taskId!))))
      .pipe(map((model: CaseModel<any, any>) => {
        return {model, ...this.info, checklist: []} as IOpenedInfo
      }))
      .pipe(switchMap((info) => {
        return taskId ? this.checklistService.criteria({
          stepName: info.model.taskDetails.name,
          caseType: info.caseType
        }).pipe(map(list => ({...info, checklist: list} as IOpenedInfo))) : of(info)
      }))
  }

  getItem(): string | null {
    return this.route.queryParamMap.get(this.itemKey);
  }


}
