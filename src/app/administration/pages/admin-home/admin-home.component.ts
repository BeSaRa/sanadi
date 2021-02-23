import {Component, OnInit} from '@angular/core';
import {ServiceItem} from '../../../shared/models/service-item';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {
  serviceList: ServiceItem[] = [];

  constructor(private langService: LangService) {
  }

  ngOnInit(): void {
    this.serviceList = [
      new ServiceItem(1,
        this.langService.getArabicLocalByKey('menu_aid'),
        this.langService.getEnglishLocalByKey('menu_aid'),
        './aid', 'mdi-hand-heart',
        'MANAGE_AID_TYPE'
      ),
      new ServiceItem(2,
        this.langService.getArabicLocalByKey('menu_organizations'),
        this.langService.getEnglishLocalByKey('menu_organizations'),
        './organizations', 'mdi-office-building'
      ),
      new ServiceItem(3,
        this.langService.getArabicLocalByKey('menu_users'),
        this.langService.getEnglishLocalByKey('menu_users'),
        './users', 'mdi-account-group'
      ),
      new ServiceItem(4,
        this.langService.getArabicLocalByKey('menu_localization'),
        this.langService.getEnglishLocalByKey('menu_localization'),
        './localization', 'mdi-google-translate'
      ),
      new ServiceItem(4,
        this.langService.getArabicLocalByKey('menu_custom_role'),
        this.langService.getEnglishLocalByKey('menu_custom_role'),
        './custom-role', 'mdi-card-account-details-star-outline',
        'MANAGE_CUSTOM_ROLE'
      )
    ];
  }

}
