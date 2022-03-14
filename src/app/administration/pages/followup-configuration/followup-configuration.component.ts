import { Component, OnInit } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { FollowupConfiguration } from '@app/models/followup-configuration';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { FollowupConfigurationService } from '@app/services/followup-configuration.service';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'followup-configuration',
  templateUrl: './followup-configuration.component.html',
  styleUrls: ['./followup-configuration.component.scss']
})
export class FollowupConfigurationComponent extends AdminGenericComponent<FollowupConfiguration, FollowupConfigurationService>{
  actions: IMenuItem<FollowupConfiguration>[] = [];
  displayedColumns: string[] = ['name', 'followUpType', 'requestType', 'responsibleTeamId', 'concernedTeamId', 'days'];
  searchText = '';

  constructor(public lang: LangService, public service: FollowupConfigurationService){
    super();
  }
  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  }
}
