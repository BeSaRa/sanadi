import { Component, inject, Input } from '@angular/core';
import { LinkedProjectTypes } from '@app/enums/linked-project-type.enum';
import { ActualInspection } from '@app/models/actual-inspection';
import { Lookup } from '@app/models/lookup';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';

@Component({
    selector: 'actual-inspection-details',
    templateUrl: 'actual-inspection-details.component.html',
    styleUrls: ['actual-inspection-details.component.scss']
})
export class ActualInspectionDetailsComponent {

    lang = inject(LangService);
    lookupService = inject(LookupService);
    @Input({required: true}) model!: ActualInspection;

    YesNo: Lookup[] = this.lookupService.listByCategory.LinkedProject;
  get moneyLaundryLabel(): string {
    return this.model.moneyLaundryOrTerrorism ? this.YesNo.find(x => x.lookupKey === LinkedProjectTypes.YES)?.getName() ?? '' :
      this.YesNo.find(x => x.lookupKey === LinkedProjectTypes.NO)?.getName() ?? ''
  }
}
