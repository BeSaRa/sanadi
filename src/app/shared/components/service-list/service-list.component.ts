import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ServiceItem} from '../../models/service-item';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
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
