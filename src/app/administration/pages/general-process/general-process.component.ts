import { UrlService } from './../../../services/url.service';
import { CrudGenericService } from '@app/generics/crud-generic-service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { generalProcess } from '@app/models/genral-process';

@Component({
  selector: 'app-general-process',
  templateUrl: './general-process.component.html',
  styleUrls: ['./general-process.component.scss']
})
export class GeneralProcessComponent extends CrudGenericService<generalProcess> {

  list: generalProcess[] = [];

  constructor(
    public http: HttpClient,
    private urlService: UrlService
  ) {
    super();
  }
  _getServiceURL(): string {
    return this.urlService.URLS.GENERAL_PROCESS;
  }
  _getModel(): new () => generalProcess {
    return generalProcess;
  }

}
