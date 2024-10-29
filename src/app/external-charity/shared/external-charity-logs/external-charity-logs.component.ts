import { Component, inject, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { ExternalCharityLog } from '@app/models/external-charity-log';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'external-charity-logs',
    templateUrl: 'external-charity-logs.component.html',
    styleUrls: ['external-charity-logs.component.scss']
})
export class ExternalCharityLogsComponent {

    userClick: typeof UserClickOn = UserClickOn;
    displayedColumns: (keyof ExternalCharityLog)[] = ['internalUserInfo','actionTypeInfo' ,'actionStatusInfo', 'comments', 'updatedOnString' ,'actionTime'];
    @Input({required:true})logList: ExternalCharityLog[] = [];
    filterControl: UntypedFormControl = new UntypedFormControl('');
    langService=inject(LangService);
    constructor() {
    }
  
}
