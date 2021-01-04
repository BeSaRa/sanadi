import {Component, OnInit} from '@angular/core';
import {ServiceItem} from '../../../shared/models/service-item';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {
  serviceList: ServiceItem[] = [
    new ServiceItem(1, 'Aid', 'Aid', './aid', 'mdi-hand-heart'),
    new ServiceItem(2, 'Organizations', 'Organizations', './organizations', 'mdi-office-building'),
    new ServiceItem(3, 'Users', 'Users', './users', 'mdi-account-group'),
    new ServiceItem(4, 'Localization', 'Localization', './localization', 'mdi-google-translate'),
    new ServiceItem(4, 'Custom Role', 'Custom Role', './custom-role', 'mdi-card-account-details-star-outline'),
  ];

  constructor() {
  }

  ngOnInit(): void {
  }

}
