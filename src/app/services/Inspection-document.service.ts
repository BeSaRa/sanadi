import { CastResponse } from "@app/decorators/decorators/cast-response";
import { DocumentService } from "./document.service";
import { FileNetDocument } from "@app/models/file-net-document";
import { Observable } from "rxjs";
import { HttpClient, HttpEventType, HttpParams } from "@angular/common/http";
import { DialogService } from "./dialog.service";
import { DomSanitizer } from "@angular/platform-browser";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { filter, map } from "rxjs/operators";
import { ActualInspection } from "@app/models/actual-inspection";

export class InspectionDocumentService extends DocumentService {


  private _model?: ActualInspection

  setModel(model: ActualInspection) {
    this._model = model
  }
  constructor(private obj: {
    http: HttpClient,
    _getServiceURL(): string,
    dialog: DialogService,
    domSanitizer: DomSanitizer,
  }) {
    super({ ...obj, _getURLSegment: () => obj._getServiceURL() });

  }
  
  deleteDocument(docId: string): Observable<boolean> {
    return this.obj.http.delete<boolean>(this.obj._getServiceURL() + '/document/' + docId, {
      params: new HttpParams({ fromObject: { taskId: `${this._model?.id}` } })
    });
  }
}