import { ComponentType } from "@angular/cdk/portal";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { CastResponse, CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { HasInterception, InterceptParam } from "@app/decorators/decorators/intercept-model";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CommonUtils } from "@app/helpers/common-utils";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { BannedPersonTerrorism, BannedPersonTerrorismFile } from "@app/models/BannedPersonTerrorism";
import { BannedPerson } from "@app/models/banned-person";
import { BannedPersonAudit } from "@app/models/banned-person-audit";
import { BannedPersonSearch } from "@app/models/banned-person-search";
import { BannedPersonAuditPopupComponent } from "@app/restricted/popups/banned-person-audit-popup/banned-person-audit-popup.component";
import { BannedPersonPopupComponent } from "@app/restricted/popups/banned-person-popup/banned-person-popup.component";
import { SelectBannedPersonPopupComponent } from "@app/restricted/popups/select-banned-person-popup/select-banned-person-popup.component";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { CommentPopupComponent } from "@app/shared/popups/comment-popup/comment-popup.component";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { DialogService } from "./dialog.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import { BannedPersonSearchInterceptor } from "@app/model-interceptors/banned-person-search-interceptor";

@CastResponseContainer({
    $default: {
        model: () => BannedPerson
    }
})
@Injectable({
    providedIn: 'root'
})
export class BannedPersonService extends CrudWithDialogGenericService<BannedPerson> {
    _getDialogComponent(): ComponentType<any> {
        return BannedPersonPopupComponent
    }
    bannedPersonSearchInterceptor = new BannedPersonSearchInterceptor();
    list!: BannedPerson[];
    _getModel(): new () => BannedPerson {
        return BannedPerson;
    }
    _getServiceURL(): string {
        return this.urlService.URLS.BANNED_PERSON;
    }
    dialog: DialogService = inject(DialogService);
    constructor(public http: HttpClient, private urlService: UrlService) {
        super();
        FactoryService.registerService('BannedPersonService', this);
    }

    @HasInterception
    @CastResponse(undefined)
    create(@InterceptParam() model: BannedPerson): Observable<BannedPerson> {
        return this.http.post<BannedPerson>(this._getServiceURL() + '/request/raca', model);
    }

    @HasInterception
    update(@InterceptParam() model: BannedPerson): Observable<BannedPerson> {
        return this.http.put<BannedPerson>(this._getServiceURL() + '/request/update', model);
    }



    @CastResponse(undefined, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getById(modelId: number): Observable<BannedPerson> {
        return this.http.get<BannedPerson>(this._getServiceURL() + '/request/raca' + modelId);
    }
    private _validateCriteria(model: any) {
        return Object.entries(model).filter(([_, value]) => CommonUtils.isValidValue(value))
            .reduce((obj, [key, value]) => {
                return { ...obj, [key]: value }
            }, {});

    }
    @CastResponse(undefined, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getApprovedRACAByCriteria(model: Partial<BannedPersonSearch>): Observable<BannedPerson[]> {
        model = this.bannedPersonSearchInterceptor.send(model);
        return this.http.get<BannedPerson[]>(this._getServiceURL() + '/search/criteria/raca', {
            params: new HttpParams({
                fromObject: this._validateCriteria(model)
            })
        });
    }
    @CastResponse(undefined, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getRACAScreeningByCriteria(model: Partial<BannedPersonSearch>): Observable<{id:number,response:BannedPerson[]}> {
        model = this.bannedPersonSearchInterceptor.send(model);
        return this.http.get<{id:number,response:BannedPerson[]}>(this._getServiceURL() + '/search/criteria/raca/screening', {
            params: new HttpParams({
                fromObject: this._validateCriteria(model)
            })
        });
    }
    @CastResponse(undefined, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getAllRacaByCriteria(model: Partial<BannedPersonSearch>): Observable<BannedPerson[]> {
        model = this.bannedPersonSearchInterceptor.send(model);
        return this.http.get<BannedPerson[]>(this._getServiceURL() + '/search/criteria/request/raca', {
            params: new HttpParams({
                fromObject: this._validateCriteria(model)
            })
        });
    }
    @CastResponse(undefined, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getApprovedMOIByCriteria(@InterceptParam() model: Partial<BannedPersonSearch>): Observable<BannedPersonTerrorism[]> {
        let criteria = this.bannedPersonSearchInterceptor.send(model) as any;
        criteria.registrationNumber = model.registrationNo
        delete criteria.registrationNo;
        return this.http.get<BannedPersonTerrorism[]>(this._getServiceURL() + '/search/criteria/moi', {
            params: new HttpParams({
                fromObject: this._validateCriteria(criteria)
            })
        });
    }
    @CastResponse(undefined, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getMOIScreeningByCriteria(@InterceptParam() model: Partial<BannedPersonSearch>): Observable<{id:number,response:BannedPersonTerrorism[]}> {
        let criteria = this.bannedPersonSearchInterceptor.send(model) as any;
        criteria.registrationNumber = model.registrationNo
        delete criteria.registrationNo;
        return this.http.get<{id:number,response:BannedPersonTerrorism[]}>(this._getServiceURL() + '/search/criteria/moi/screening', {
            params: new HttpParams({
                fromObject: this._validateCriteria(criteria)
            })
        });
    }
    @CastResponse(undefined, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getALL_MOIByCriteria(@InterceptParam() model: Partial<BannedPersonSearch>): Observable<BannedPersonTerrorism[]> {
        let criteria = this.bannedPersonSearchInterceptor.send(model) as any;
        criteria.registrationNumber = model.registrationNo
        delete criteria.registrationNo;
        return this.http.get<BannedPersonTerrorism[]>(this._getServiceURL() + '/search/criteria/request/moi', {
            params: new HttpParams({
                fromObject: this._validateCriteria(criteria)
            })
        });
    }
    @CastResponse(undefined, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getByRequestStatus(requestStatus: number): Observable<BannedPerson[]> {
        return this.http.get<BannedPerson[]>(this._getServiceURL() + `/request/raca/request-status/${requestStatus}`);
    }

    @CastResponse(() => BannedPersonTerrorism, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getMOIByRequestStatus(requestStatus: number): Observable<BannedPersonTerrorism[]> {
        return this.http.get<BannedPersonTerrorism[]>(this._getServiceURL() + `/request/moi/request-status/${requestStatus}`)

    }

    @CastResponse(undefined, {
        fallback: '$default',
        unwrap: 'rs',
        
    })
    getMOIFiles(): Observable<BannedPersonTerrorismFile[]> {
        return this.http.get<BannedPersonTerrorismFile[]>
            (this._getServiceURL() + `/request/moi/file-details`)

    }
    @CastResponse(() => BannedPersonTerrorism, {
        fallback: '$default',
        unwrap: 'rs'
    })
    getMOIByFileName(fileName: string): Observable<BannedPersonTerrorism[]> {
        return this.http.get<BannedPersonTerrorism[]>(this._getServiceURL() + `/request/moi/file-name`, {
            params: new HttpParams({
                fromObject: { fileName }
            })
        })

    }

    send(id: number) {
        return this.http.put<BannedPerson[]>(this._getServiceURL() + `/request/raca/${id}/send`, {});
    }
    approve(id: number) {
        return this.http.put<BannedPerson[]>(this._getServiceURL() + `/request/raca/${id}/approve`, {});
    }
    approveMoi(fullSerialNumber: string) {
        return this.http.put<boolean>(this._getServiceURL() + `/request/moi/approve`, {},
            {
                params: new HttpParams({
                    fromObject: { 'FullSerialNumber': fullSerialNumber }
                })
            }
        );
    }
    rejectMoi(fullSerialNumber: string) {
        return this.http.put<boolean>(this._getServiceURL() + `/request/moi/reject`, {},
            {
                params: new HttpParams({
                    fromObject: { 'FullSerialNumber': fullSerialNumber }
                })
            }
        );
    }

    terminate(id: number) {
        return this.http.put<BannedPerson[]>(this._getServiceURL() + `/request/raca/${id}/delete`, {});
    }

    reject(requestId: number, reason: string) {
        return this.http.put<BannedPerson[]>(this._getServiceURL() + `/request/raca/reject`, {
            requestId,
            reason
        });
    }
    return(requestId: number, reason: string) {
        return this.http.put<BannedPerson[]>(this._getServiceURL() + `/request/raca/return`, {
            requestId,
            reason
        });
    }

    @CastResponse(() => BannedPersonAudit, {
        fallback: '$default',
        unwrap: 'rs'
    })
    _getLogs(id: number): Observable<BannedPersonAudit[]> {
        return this.http.get<BannedPersonAudit[]>(this._getServiceURL() + `/request/raca/request-audit/${id}`)
    }


    showLogs(id: number): Observable<DialogRef> {
        return this._getLogs(id).pipe(
            switchMap(async (list) => this.dialog.show<IDialogData<BannedPersonAudit[]>>
                (BannedPersonAuditPopupComponent, {
                    model: list,
                    operation: OperationTypes.VIEW
                }))
        )
    }

    showCommentPopup(title?: keyof ILanguageKeys): DialogRef {

        return this.dialog.show<{ title?: keyof ILanguageKeys }>
            (CommentPopupComponent, { title })
    }
    showSelectBannedPersonPopup(list: BannedPerson[]): DialogRef {
        return this.dialog.show<{ list: BannedPerson[] }>
            (SelectBannedPersonPopupComponent, { list })
    }

    UploadMoiFiles(files: File[]) {

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('BannedFiles', files[i]!);
        }


        return this.http.post(this._getServiceURL() + '/request/moi', formData)

    }
}