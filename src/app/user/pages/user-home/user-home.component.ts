import {Component, OnInit} from '@angular/core';
import {ServiceItem} from '../../../shared/models/service-item';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {
  serviceList: ServiceItem[] = [];

  constructor(private langService: LangService) {
  }

  ngOnInit(): void {
    this.serviceList = [
      new ServiceItem(1, this.langService.getArabicLocalByKey('menu_provide_request'), this.langService.getEnglishLocalByKey('menu_provide_request'), './request', 'mdi-database-plus'),
      new ServiceItem(2, this.langService.getArabicLocalByKey('menu_inquiries'), this.langService.getEnglishLocalByKey('menu_inquiries'), './inquiry', 'mdi-database-search'),
      new ServiceItem(3, this.langService.getArabicLocalByKey('menu_administration'), this.langService.getEnglishLocalByKey('menu_administration'), '../administration', 'mdi-application-cog')
    ];
  }

}
