import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ServiceItem} from '../../models/service-item';
import {listAnimation} from '../../../animations/list.animation';


@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
  animations: [listAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceListComponent implements OnInit {
  @Input()
  public list: ServiceItem[] = [];

  constructor() {
  }

  ngOnInit(): void {
  }

}
