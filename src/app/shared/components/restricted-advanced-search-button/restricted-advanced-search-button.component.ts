import { Component, inject } from '@angular/core';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { RestrictedAdvancedSearchPopupComponent } from '@app/restricted/popups/restricted-advanced-search-popup/restricted-advanced-search-popup.component';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'restricted-advanced-search-button',
  templateUrl: './restricted-advanced-search-button.component.html',
  styleUrl: './restricted-advanced-search-button.component.scss'
})
export class RestrictedAdvancedSearchButtonComponent {


  dialog = inject(DialogService);
  lang= inject(LangService);

  get allowedPermissions(): PermissionsEnum[] {
    return [
      PermissionsEnum.MANAGE_BANNED_PERSON_MOI,
      PermissionsEnum.MANAGE_BANNED_PERSON_RACA,
      PermissionsEnum.WORLD_CHECK_SEARCH,
    ]
  }

  showRestrictedAdvancedSearch() {
    this.dialog.show(RestrictedAdvancedSearchPopupComponent)
  }
}
