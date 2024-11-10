import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { Pagination } from '@app/models/pagination';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, switchMap, of } from 'rxjs';
import { PenaltyViolationLog } from './../models/penalty-violation-log';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
@CastResponseContainer({
    $default: {
      model: () => PenaltyViolationLog
    },
    $pagination: {
      model: () => Pagination,
      shape: { 'rs.*': () => PenaltyViolationLog }
    }
  })
  @Injectable({
    providedIn: 'root'
  })
  export class PenaltyViolationLogService extends CrudWithDialogGenericService<PenaltyViolationLog> {
    list: PenaltyViolationLog[] = [];
    http = inject(HttpClient);
    urlService = inject(UrlService);
    dialog = inject(DialogService);
  
    constructor() {
      super();
      FactoryService.registerService('PenaltyViolationLogService', this);
    }
  
    _getModel(): new () => PenaltyViolationLog {
      return PenaltyViolationLog;
    }
  
    _getDialogComponent(): ComponentType<any> {
      throw new Error('not implemented')
    }
  
    _getServiceURL(): string {
      return this.urlService.URLS.PENALTIES_VIOLATION_LOGS;
    }
  
  
   
  }
  