import { CoordinationWithOrganizationsRequest } from '@models/coordination-with-organizations-request';
import { DialogService } from '@services/dialog.service';
import { CoordinationWithOrganizationsRequestService } from '@services/coordination-with-organizations-request.service';
import { Component, Inject, OnInit } from '@angular/core';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { LangService } from '@services/lang.service';

@Component({
  selector: 'app-participant-organizations-popup',
  templateUrl: './participant-organizations-popup.component.html',
  styleUrls: ['./participant-organizations-popup.component.scss'],
})
export class ParticipantOrganizationsPopupComponent implements OnInit {
  constructor(
    private dialog: DialogService,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      service: CoordinationWithOrganizationsRequestService;
      orgId: number;
      model: CoordinationWithOrganizationsRequest | undefined;
    }
  ) { }

  get isOrganizaionOfficers(): boolean {
    return !!(this.data.model?.organizaionOfficerList?.length! > 0);
  }
  get isBuildingAbilities(): boolean {
    return !!(this.data.model?.buildingAbilitiesList?.length! > 0);
  }
  get isEffectiveCoordinationCapabilities(): boolean {
    return !!(this.data.model?.effectiveCoordinationCapabilities?.length! > 0);
  }
  get isResearchAndStudies(): boolean {
    return !!(this.data.model?.researchAndStudies?.length! > 0);
  }
  get isTemplateList(): boolean {
    return !!(this.data.model?.templateList?.length! > 0);
  }
  ngOnInit() { }

  submit() { }
}
