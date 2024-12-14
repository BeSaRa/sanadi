import { Component, Input, inject } from '@angular/core';
import { ProjectModel } from '@app/models/project-model';
import { LangService } from '@app/services/lang.service';

@Component({
    selector: 'project-model-summary',
    templateUrl: 'project-model-summary.component.html',
    styleUrls: ['project-model-summary.component.scss']
})
export class ProjectModelSummaryComponent {
    @Input() model?: ProjectModel;
    lang = inject(LangService);
}
