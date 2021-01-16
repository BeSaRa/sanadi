import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {Ticket} from '../models/ticket';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {interceptTicket} from '../model-interceptors/ticket-interceptor';

@Injectable({
  providedIn: 'root'
})
export class TicketService extends BackendGenericService<Ticket> {
  list!: Ticket[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('TicketService', this);
  }

  _getModel(): any {
    return Ticket;
  }

  _getSendInterceptor(): any {
    return interceptTicket
  }

  _getServiceURL(): string {
    return this.urlService.URLS.TICKETS;
  }
}
