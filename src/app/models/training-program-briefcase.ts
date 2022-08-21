import { TrainingProgramBriefcaseService } from '@app/services/training-program-briefcase.service';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { Localization } from '@app/models/localization';
import { FileIconsEnum, FileMimeTypesEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { InterceptModel } from "@decorators/intercept-model";
import { TrainingProgramBriefcaseInterceptor } from "@app/model-interceptors/training-program-briefcase-interceptor";

const { receive, send } = new TrainingProgramBriefcaseInterceptor()

@InterceptModel({
  receive, send
})
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

  isPdfItem(): boolean {
    return (this.mimeType + '').toLowerCase() === FileMimeTypesEnum.PDF.toLowerCase();
  }

  isVideoItem(): boolean {
    return (this.mimeType + '').toLowerCase() === FileMimeTypesEnum.MP4.toLowerCase()
      || (this.mimeType + '').toLowerCase() === FileMimeTypesEnum.MKV.toLowerCase();
  }

  isPowerpointItem(): boolean {
    return (this.mimeType + '').toLowerCase() === FileMimeTypesEnum.PPT.toLowerCase()
      || (this.mimeType + '').toLowerCase() === FileMimeTypesEnum.PPTX.toLowerCase();
  }

  getIcon(): string {
    let icon: string = FileIconsEnum.FILE;
    if (this.isPdfItem()) {
      icon = FileIconsEnum.PDF;
    } else if (this.isVideoItem()) {
      icon = FileIconsEnum.VIDEO;
    } else if (this.isPowerpointItem()) {
      icon = FileIconsEnum.PPTX;
    }
    return icon;
  }

  getIconTooltip(): Localization {
    let localization: Localization = this.langService.getLocalByKey('file');
    if (this.isPdfItem()) {
      localization = this.langService.getLocalByKey('file_pdf');
    } else if (this.isVideoItem()) {
      localization = this.langService.getLocalByKey('file_video');
    } else if (this.isPowerpointItem()) {
      localization = this.langService.getLocalByKey('file_powerpoint');
    }
    return localization;
  }
}
