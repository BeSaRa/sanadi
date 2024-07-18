import { Component, inject } from '@angular/core';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'restricted-advanced-search-popup',
  templateUrl: './restricted-advanced-search-popup.component.html',
  styleUrl: './restricted-advanced-search-popup.component.scss'
})
export class RestrictedAdvancedSearchPopupComponent {

  lang = inject(LangService);
  popupTitle = this.lang.map.menu_restricted_advanced_search; 
}
