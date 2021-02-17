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
      new ServiceItem(1, this.langService.getArabicLocalByKey('menu_provide_request'),
        this.langService.getEnglishLocalByKey('menu_provide_request'), './request', 'mdi-database-plus'),
      new ServiceItem(2, this.langService.getArabicLocalByKey('menu_inquiries'),
        this.langService.getEnglishLocalByKey('menu_inquiries'), './inquiry', 'mdi-account-search'),
      new ServiceItem(5, this.langService.getArabicLocalByKey('menu_request_search'),
        this.langService.getEnglishLocalByKey('menu_request_search'), './request-search', 'mdi-text-box-search-outline'),
      new ServiceItem(3, this.langService.getArabicLocalByKey('menu_administration'),
        this.langService.getEnglishLocalByKey('menu_administration'), '../administration', 'mdi-application-cog'),
      new ServiceItem(4, this.langService.getArabicLocalByKey('menu_under_process'),
        this.langService.getEnglishLocalByKey('menu_under_process'), './requests-under-process', 'mdi-book-sync')
    ];
  }

}
