import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import {iif, Observable, of} from 'rxjs';
import {CaseModel} from "@app/models/case-model";
import {InboxService} from "@app/services/inbox.service";
import {EncryptionService} from "@app/services/encryption.service";
import {INavigatedItem} from "@app/interfaces/inavigated-item";
import {map, switchMap} from "rxjs/operators";
import {OpenFrom} from "@app/enums/open-from.enum";
import {IOpenedInfo} from "@app/interfaces/i-opened-info";
import {ChecklistService} from "@app/services/checklist.service";
import {ConfigurationService} from "@services/configuration.service";

export class ServiceItemResolver {
    private static data: {
        itemKey: string,
        route: ActivatedRouteSnapshot,
        info?: INavigatedItem,
        inboxService: InboxService,
        checklistService: ChecklistService,
        encryptionService: EncryptionService,
        configurationService: ConfigurationService,
    } = {} as any;

    private static _init(route: ActivatedRouteSnapshot): void {
        this.data.inboxService = inject(InboxService);
        this.data.checklistService = inject(ChecklistService);
        this.data.encryptionService = inject(EncryptionService);
        this.data.configurationService = inject(ConfigurationService);

        this.data.itemKey = this.data.configurationService.CONFIG.E_SERVICE_ITEM_KEY;
        this.data.route = route;
    }

    static resolve: ResolveFn<IOpenedInfo | null> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IOpenedInfo | null> => {
        this._init(route);
        const item = this.getItem();
        if (item === null) {
            return of(null);
        }
        // decrypt information
        try {
            this.data.info = this.data.encryptionService.decrypt<INavigatedItem>(item);
        } catch (e) {
            // if there is error in decryption return null
            console.log('error in decryption');
            return of(null)
        }
        const {caseId, caseType, taskId, openFrom} = this.data.info;
        if (!caseId || !caseType) { // if we have missing needed properties while decrypt the info return null
            console.log('missing info');
            return of(null);
        }
        const service = this.data.inboxService.getService(caseType);
        return of(openFrom)
            .pipe(switchMap(() => iif(() => openFrom === OpenFrom.SEARCH, service.getById(caseId), service.getTask(taskId!))))
            .pipe(map((model: CaseModel<any, any>) => {
                return {model, ...this.data.info, checklist: []} as IOpenedInfo
            }))
            .pipe(switchMap((info) => {
                return taskId ? this.data.checklistService.criteria({
                    stepName: info.model.taskDetails.name,
                    caseType: info.caseType
                }).pipe(map(list => ({...info, checklist: list} as IOpenedInfo))) : of(info)
            }))
    }

    static getItem(): string | null {
        return this.data.route.queryParamMap.get(this.data.itemKey);
    }
}
