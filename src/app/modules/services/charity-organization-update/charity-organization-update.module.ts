import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CharityOrganizationUpdateRoutingModule} from './charity-organization-update-routing.module';
import {
  CharityOrganizationUpdateOutputsComponent
} from './pages/charity-organization-update-outputs/charity-organization-update-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  CharityOrganizationUpdateComponent
} from '@modules/services/charity-organization-update/pages/charity-organization-update/charity-organization-update.component';
import {BylawsComponent} from '@modules/services/charity-organization-update/shared/bylaws/bylaws.component';
import {
  CharityBranchComponent
} from '@modules/services/charity-organization-update/shared/charity-branch/charity-branch.component';
import {
  CharityDecisionsComponent
} from '@modules/services/charity-organization-update/shared/charity-decisions/charity-decisions.component';
import {
  ForeignAidClassificationsComponent
} from '@modules/services/charity-organization-update/shared/foreign-aid-classifications/foreign-aid-classifications.component';
import {MembersComponent} from '@modules/services/charity-organization-update/shared/members/members.component';
import {
  CharityReportsComponent
} from '@modules/services/charity-organization-update/shared/charity-reports/charity-reports.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import {
  OrganizationOfficersComponent
} from '@modules/services/charity-organization-update/shared/organization-officers/organization-officers.component';
import {
  FollowupDateApprovePopupComponent
} from '@modules/services/charity-organization-update/popups/follow-up-date-approve-popup/follow-up-date-approve-popup.component';
import { OrganizationOfficerPopupComponent } from '@modules/services/charity-organization-update/shared/organization-officers/organization-officer-popup/organization-officer-popup.component';
import { CharityBranchPopupComponent } from '@modules/services/charity-organization-update/shared/charity-branch/charity-branch-popup/charity-branch-popup.component';
import { MembersPopupComponent } from '@modules/services/charity-organization-update/shared/members/members-popup/members-popup.component';
import { ForeignAidClassificationsPopupComponent } from './shared/foreign-aid-classifications/foreign-aid-classifications-popup/foreign-aid-classifications-popup.component';


@NgModule({
  declarations: [
    CharityOrganizationUpdateComponent,
    CharityOrganizationUpdateOutputsComponent,
    BylawsComponent,
    CharityBranchComponent,
    CharityBranchPopupComponent,
    CharityDecisionsComponent,
    ForeignAidClassificationsComponent,
    ForeignAidClassificationsPopupComponent,
    MembersComponent,
    MembersPopupComponent,
    CharityReportsComponent,
    OrganizationOfficersComponent,
    OrganizationOfficerPopupComponent,
    FollowupDateApprovePopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    CharityOrganizationUpdateRoutingModule
  ]
})
export class CharityOrganizationUpdateModule {
}
