import {FactoryService} from '../services/factory.service';
import {TicketService} from '../services/ticket.service';
import {Observable, of} from 'rxjs';
import {BaseModel} from './base-model';

export class Ticket extends BaseModel<Ticket> {
  id!: number;
  name!: string;
  service: TicketService;
  status: boolean = false;

  constructor() {
    super();
    this.service = FactoryService.getService('TicketService');
  }

  create(): Observable<Ticket> {
    if (this.id) {
      return of(this);
    }
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<Ticket> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<Ticket> {
    return this.service.update(this);
  }

  toggleStatus(): Ticket {
    this.status = !this.status;
    return this;
  }
}
