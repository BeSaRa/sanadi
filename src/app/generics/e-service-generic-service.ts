import {HttpClient} from '@angular/common/http';
import {isObservable, Observable, of} from 'rxjs';
import {FileNetDocument} from '../models/file-net-document';
import {CaseComment} from '../models/case-comment';
import {CommentService} from '../services/comment.service';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {Generator} from '../decorators/generator';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {BackendServiceModelInterface} from '../interfaces/backend-service-model-interface';
import {DocumentService} from '../services/document.service';
import {DialogService} from '../services/dialog.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ActionLogService} from '../services/action-log.service';
import {BlobModel} from '../models/blob-model';
import {map} from 'rxjs/operators';
import {RecommendationService} from '../services/recommendation.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {ActionRegistryPopupComponent} from '../shared/popups/action-registry-popup/action-registry-popup.component';
import {ManageCommentPopupComponent} from '../shared/popups/manage-comment-popup/manage-comment-popup.component';
import {ManageRecommendationPopupComponent} from '../shared/popups/manage-recommendation-popup/manage-recommendation-popup.component';
import {DocumentsPopupComponent} from '../shared/popups/documents-popup/documents-popup.component';
import {ILanguageKeys} from '../interfaces/i-language-keys';
import {ComponentFactoryResolver} from '@angular/core';
import {SearchService} from '../services/search.service';
import {FormlyFieldConfig} from '@ngx-formly/core/lib/components/formly.field.config';
import {IFormRowGroup} from '../interfaces/iform-row-group';
import {IFormField} from '../interfaces/iform-field';
import {CustomFormlyFieldConfig} from '../interfaces/custom-formly-field-config';
import {DateUtils} from '../helpers/date-utils';
import {FactoryService} from '../services/factory.service';
import {DynamicOptionsService} from '../services/dynamic-options.service';

export abstract class EServiceGenericService<T extends { id: string }>
  implements Pick<BackendServiceModelInterface<T>, '_getModel' | '_getInterceptor'> {
  abstract _getModel(): any;

  abstract _getServiceURL(): string;

  abstract _getInterceptor(): Partial<IModelInterceptor<T>>;

  abstract getSearchCriteriaModel<S extends T>(): T;

  abstract getCaseComponentName(): string;

  abstract jsonSearchFile: string;

  abstract http: HttpClient;
  abstract dialog: DialogService;
  abstract domSanitizer: DomSanitizer;
  abstract commentService: CommentService;
  abstract recommendationService: RecommendationService;
  abstract documentService: DocumentService;
  abstract actionLogService: ActionLogService;
  abstract searchService: SearchService;
  abstract interceptor: IModelInterceptor<T>;
  abstract serviceKey: keyof ILanguageKeys;
  abstract cfr: ComponentFactoryResolver;
  abstract caseStatusIconMap: Map<number, string>;
  abstract searchColumns: string[];
  abstract dynamicService: DynamicOptionsService;

  getCFR(): ComponentFactoryResolver {
    return this.cfr;
  }

  ping(): void {
    // just a dummy method to invoke it later to prevent webstorm from Blaming us that we inject service not used.
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _create(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.post<T>(this._getServiceURL(), model);
  }

  create(model: T): Observable<T> {
    return this._create(model);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _update(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.put<T>(this._getServiceURL(), model);
  }

  update(model: T): Observable<T> {
    return this._update(model);
  }

  save(model: T): Observable<T> {
    return model.id ? this.update(model) : this.create(model);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _commit(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.post<T>(this._getServiceURL() + '/commit', model);
  }

  commit(model: T): Observable<T> {
    return this._commit(model);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _draft(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.post<T>(this._getServiceURL() + '/draft', model);
  }

  draft(model: T): Observable<T> {
    return this._draft(model);
  }

  private _start(caseId: string): Observable<boolean> {
    return this.http.request<boolean>('POST', this._getServiceURL() + '/' + caseId + '/start', {body: null});
  }

  start(caseId: string): Observable<boolean> {
    return this._start(caseId);
  }

  @Generator(undefined, false, {property: 'rs'})
  private _getById(caseId: string): Observable<T> {
    return this.http.get<T>(this._getServiceURL() + '/' + caseId + '/details');
  }

  getById(caseId: string): Observable<T> {
    return this._getById(caseId);
  }

  search(model: Partial<T>): Observable<T[]> {
    return this.searchService.search(model);
  }

  addComment(caseId: string, comment: Partial<CaseComment>): Observable<CaseComment> {
    return this.commentService.create(caseId, comment);
  }

  loadSearchFields(): Observable<FormlyFieldConfig[]> {
    return this.jsonSearchFile ? this.http.get<IFormRowGroup[]>('assets/search/' + this.jsonSearchFile)
      .pipe(map((rows: IFormRowGroup[]) => this.castFormlyFields(rows))) : of([]);
  }

  getComments(caseId: string): Observable<CaseComment[]> {
    return this.commentService.load(caseId);
  }

  addDocument(caseId: string,
              document: FileNetDocument,
              progressCallback?: (percentage: number) => void): Observable<any> {
    return this.documentService.addSingleDocument(caseId, document, progressCallback);
  }

  addBulkDocuments(caseId: string, document: FileNetDocument, progressCallback?: (percentage: number) => void): Observable<any> {
    return this.documentService.addSingleDocument(caseId, document, progressCallback);
  }

  getCaseActions(): void {

  }

  getCaseLocations(): void {

  }

  getCaseDetails(): void {

  }

  getContainedDocument(): void {

  }

  addRecommendation(): void {
  }

  getCaseRecommendations(): void {
  }

  exportActions(caseId: string): Observable<BlobModel> {
    return this.actionLogService.exportActions(caseId);
  }

  openActionLogs(caseId: string): DialogRef {
    return this.dialog.show(ActionRegistryPopupComponent, {service: this, caseId});
  }

  openCommentsDialog(caseId: string): DialogRef {
    return this.dialog.show(ManageCommentPopupComponent, {service: this, caseId});
  }

  openRecommendationDialog(caseId: string, onlyLogs: boolean = false): DialogRef {
    return this.dialog.show(ManageRecommendationPopupComponent, {service: this, caseId, onlyLogs});
  }

  openDocumentDialog(caseId: string): DialogRef {
    return this.dialog.show(DocumentsPopupComponent, {service: this, caseId});
  }

  downloadDocument(): void {
    //inquiry/document/{docId}/download
    //Download document as PDF.
  }

  exportModel(caseId: string): Observable<BlobModel> {
    return this.http.get(this._getServiceURL() + '/model/' + caseId + '/export/', {
      responseType: 'blob',
      observe: 'body'
    }).pipe(map(blob => new BlobModel(blob, this.domSanitizer)));
  }

  exportSearch(criteria: Partial<T>): Observable<BlobModel> {
    return this.searchService.exportSearch(criteria);
  }

  @Generator(undefined, false, {property: 'rs'})
  private _getTask(taskId: string): Observable<T> {
    return this.http.get<T>(this._getServiceURL() + '/task/' + taskId);
  }


  getTask(taskId: string): Observable<T> {
    return this._getTask(taskId);
  }

  claimTask(): void {

  }

  completeTask(): void {

  }

  private castFormlyFields(rows: IFormRowGroup[]): FormlyFieldConfig[] {
    return rows.map(row => this.generateFormRow(row));
  }

  private generateFormRow(row: IFormRowGroup): FormlyFieldConfig {
    return {
      fieldGroupClassName: 'row mb-3 formly-row',
      fieldGroup: row.fields?.map(field => EServiceGenericService.generateFormField(field, row)),
    };
  }

  private static generateFormField(field: IFormField, row: IFormRowGroup): CustomFormlyFieldConfig {
    if (field.type === 'dateField') {
      return EServiceGenericService.generateDateField(field, row);
    } else if (field.type === 'selectField') {
      return EServiceGenericService.generateSelectField(field, row);
    } else {
      return EServiceGenericService.generateDefaultFormField(field, row);
    }
  }

  private static generateDefaultFormField(field: IFormField, row: IFormRowGroup): CustomFormlyFieldConfig {
    return {
      key: field.key,
      type: field.type,
      templateOptions: {
        label: field.label,
        required: field.validations?.required,
        rows: field.templateOptions?.rows
      },
      wrappers: [(row.fields && row.fields?.length === 1 ? 'col-md-2-10' : 'col-md-4-8')]
    };
  }

  private static generateDateField(field: IFormField, row: IFormRowGroup): CustomFormlyFieldConfig {
    let defaultValue = field.dateOptions?.defaultValue !== null ? new Date() : null;
    if (field.dateOptions?.value && field.dateOptions.operator && defaultValue) {
      let [number, type] = field.dateOptions.value.split(' ');
      let isPlus = field.dateOptions.operator === '+';

      switch (type.toLowerCase()) {
        case 'y':
        case 'year':
          let year = defaultValue?.getFullYear()!;
          defaultValue?.setFullYear(isPlus ? (year + (Number(number))) : (year - (Number(number))));
          break;
        case 'd':
        case 'day':
          let day = defaultValue?.getDate()!;
          defaultValue?.setDate(isPlus ? (day + (Number(number))) : (day - (Number(number))));
          break;
        case 'm':
        case 'month':
          let month = defaultValue?.getMonth()!;
          defaultValue?.setMonth(isPlus ? (month + (Number(number))) : (month - (Number(number))));
          break;
      }

    }
    return {
      key: field.key,
      type: field.type,
      templateOptions: {
        label: field.label,
        required: field.validations?.required,
        rows: field.templateOptions?.rows
      },
      dateOptions: field.dateOptions,
      defaultValue: defaultValue ? DateUtils.changeDateToDatepicker(defaultValue) : null,
      wrappers: [(row.fields && row.fields?.length === 1 ? 'col-md-2-10' : 'col-md-4-8')]
    };
  }

  private static generateSelectField(field: IFormField, row: IFormRowGroup): CustomFormlyFieldConfig {
    const dynamicOptionsService: DynamicOptionsService = FactoryService.getService('DynamicOptionsService');
    let options: Observable<any[]>;
    if (field.selectOptions?.loader) {
      options = dynamicOptionsService.load(field.selectOptions?.loader);
    } else {
      options = isObservable(field.selectOptions?.options!) ? field.selectOptions?.options! : of(field.selectOptions?.options!);
    }
    field.selectOptions!.options = options;
    return {
      key: field.key,
      type: field.type,
      templateOptions: {
        label: field.label,
        required: field.validations?.required,
        rows: field.templateOptions?.rows,
        options: options
      },
      selectOptions: field.selectOptions,
      defaultValue: field.selectOptions?.defaultValue,
      wrappers: [(row.fields && row.fields?.length === 1 ? 'col-md-2-10' : 'col-md-4-8')]
    };
  }

  getStatusIcon(caseStatus: number): string {
    return this.caseStatusIconMap.has(caseStatus) ? this.caseStatusIconMap.get(caseStatus)! : '';
  }
}
