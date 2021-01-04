import {Component, OnInit} from '@angular/core';
import {ServiceItem} from '../../../shared/models/service-item';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {
  serviceList: ServiceItem[] = [
    new ServiceItem(2, 'Inquiry', 'Inquiry', './inquiry', 'mdi-database-search'),
    new ServiceItem(1, 'Request', 'Request', './request', 'mdi-database-plus'),
    new ServiceItem(3, 'Admin', 'Admin', '../admin', 'mdi-application-cog')
  ];

  constructor() {
  }

  ngOnInit(): void {
    setTimeout(() => {
      console.log('this.serviceList[0].arName', this.serviceList[0].arName);
    }, 5000);
  }

}
