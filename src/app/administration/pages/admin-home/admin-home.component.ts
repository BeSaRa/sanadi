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
        this.langService.getArabicLocalByKey('aid'),
        this.langService.getEnglishLocalByKey('aid'),
        './aid', 'mdi-hand-heart'
      ),
      new ServiceItem(2,
        this.langService.getArabicLocalByKey('organizations'),
        this.langService.getEnglishLocalByKey('organizations'),
        './organizations', 'mdi-office-building'
      ),
      new ServiceItem(3,
        this.langService.getArabicLocalByKey('users'),
        this.langService.getEnglishLocalByKey('users'),
        './users', 'mdi-account-group'
      ),
      new ServiceItem(4,
        this.langService.getArabicLocalByKey('localization'),
        this.langService.getEnglishLocalByKey('localization'),
        './localization', 'mdi-google-translate'
      ),
      new ServiceItem(4,
        this.langService.getArabicLocalByKey('custom_role'),
        this.langService.getEnglishLocalByKey('custom_role'),
        './custom-role', 'mdi-card-account-details-star-outline'
      )
    ];
  }

}
