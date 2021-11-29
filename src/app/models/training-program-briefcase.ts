import {TrainingProgramBriefcaseService} from '@app/services/training-program-briefcase.service';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';
import {Localization} from '@app/models/localization';

export class TrainingProgramBriefcase extends SearchableCloneable<TrainingProgramBriefcase> {
  service!: TrainingProgramBriefcaseService;
  langService!: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('TrainingProgramBriefcaseService');
    this.langService = FactoryService.getService('LangService');
  }

  id!: string;
  creatorId!: number;
  lastModifierId!: number;
  trainingProgramId!: number;
  documentTitle!: string;
  mimeType!: string;
  contentSize!: number;
  minorVersionNumber!: number;
  majorVersionNumber!: number;
  vsId!: string;
  versionStatus!: number;
  isCurrent!: boolean;
  classDescription: string = 'TrainingProgramBundle';


  getIcon(): string {
    return this.mimeType === 'application/pdf' ? 'mdi-file-pdf-outline' : 'mdi-file-video-outline';
  }

  getIconTooltip(): Localization {
    return this.mimeType === 'application/pdf' ? this.langService.getLocalByKey('file_pdf') : this.langService.getLocalByKey('file_video');
  }
}
