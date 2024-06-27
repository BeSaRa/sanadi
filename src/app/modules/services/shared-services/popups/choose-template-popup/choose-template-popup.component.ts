import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { DialogRef } from "@app/shared/models/dialog-ref";
import { LangService } from "@services/lang.service";
import { ProjectModel } from "@app/models/project-model";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { TableComponent } from "@app/shared/components/table/table.component";
import { ProjectWorkArea } from "@app/enums/project-work-area";
import { Lookup } from "@app/models/lookup";
import { ProjectTemplate } from "@app/models/projectTemplate";
import { PublicTemplateStatus } from "@app/enums/public-template-status";
import { CaseTypes } from "@app/enums/case-types.enum";
import { ImplementationTemplate } from "@models/implementation-template";
import { ProjectImplementationService } from "@services/project-implementation.service";
import { catchError, combineAll, filter, map, switchMap, take, tap } from "rxjs/operators";
import { CustomValidators } from "@app/validators/custom-validators";
import { DialogService } from '@app/services/dialog.service';
import { ProjectModelPreviewComponent } from '@app/modules/services/project-models/popups/project-model-preview/project-model-preview.component';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ProjectImplementation } from '@app/models/project-implementation';
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'choose-template',
  templateUrl: './choose-template-popup.component.html',
  styleUrls: ['./choose-template-popup.component.scss']
})
export class ChooseTemplatePopupComponent implements AfterViewInit {
  public displayedColumns: string[] = ['checkbox', 'projectName', 'serial', 'country', 'status', 'totalCost']
  private needReview = (new Lookup().clone({
    arName: this.lang.getArabicLocalByKey('need_review'),
    enName: this.lang.getEnglishLocalByKey('need_review')
  }))
  private noNeedReview = (new Lookup().clone({
    arName: this.lang.getArabicLocalByKey('no_need_review'),
    enName: this.lang.getEnglishLocalByKey('no_need_review')
  }))

  private readonly oldProjectTemplate?: ProjectTemplate
  private readonly oldImplementationTemplate?: ImplementationTemplate
  private caseId?: string
  private requestType!: number
  @ViewChild(TableComponent)
  private table!: TableComponent;

  inputMaskPatterns = CustomValidators.inputMaskPatterns


  constructor(@Inject(DIALOG_DATA_TOKEN) public data: {
    templates: ProjectModel[],
    projectTemplate?: ProjectTemplate,
    implementationTemplate: ImplementationTemplate,
    caseType: CaseTypes,
    workArea: ProjectWorkArea,
    requestType: number
    caseId?: string,
  },
    private dialog: DialogService,
    private projectImplementationService: ProjectImplementationService,
    private dialogRef: DialogRef,
    private router: Router,
    public lang: LangService) {
    this.data.workArea === ProjectWorkArea.OUTSIDE_QATAR ? this.displayedColumns.splice(3, 0, 'domain') : null;
    this.oldImplementationTemplate = data.implementationTemplate;
    this.oldProjectTemplate = data.projectTemplate;
    this.data.caseType === CaseTypes.PROJECT_IMPLEMENTATION ? this.displayedColumns.push('targetAmount') : null;
    this.caseId = this.data.caseId;
    this.requestType = this.data.requestType;
    this.displayedColumns.push('actions');
  }

  ngAfterViewInit(): void {
    this.data.projectTemplate ? this.table.selection.setSelection(this.data.templates.find((item) => item.id === this.data.projectTemplate?.templateId)) : null
  }

  close(): void {
    this.dialogRef.close(undefined)
  }
  viewProjrctModel(template: ProjectModel) {
    this.dialog.show(ProjectModelPreviewComponent, {
      id: template.requestCaseId
    })
  }
  checkTemplate(template: ProjectModel) {
    this.projectImplementationService.checkTemplate(template.id)
      .pipe(
        filter(project => {
          if (!project) {
            this.dialog.success(this.lang.map.lbl_valid_template)
          }
          return !!project
        }),
        switchMap((project: ProjectImplementation) => {
          const message = this.lang.map.invalid_template_type_x_serial_y_status_z.change({
            x:project.requestTypeInfo.getName(),
            y:project.fullSerial?? this.lang.map.lbl_none,
            z:project.caseStatusInfo.getName()
          })
         return this.dialog.confirm(message).onAfterClose$
          .pipe(map((click: UserClickOn) => {
            return { project, click }
          }))
        }),
        tap(({ project, click }) => {
          if (click === UserClickOn.YES) {
            // this.router.navigateByUrl(project.itemRoute + '?item=' + project.itemDetails);
            project.setItemRoute();
            this.router.navigate([project.itemRoute], { queryParams: { item: project.itemDetails } }).then()
            this.dialogRef.close() ;
          }
          
        }),
        take(1)
      )
      .subscribe()

  }
  save(): void {
    if (this.isSaveDisabled())
      return;

    if (this.data.caseType === CaseTypes.PROJECT_IMPLEMENTATION) {
      this.saveForImplementation()
      return;
    }
    const model = (this.table.selection.selected[0] as unknown as ProjectModel)
    const noNeedReview = model.templateStatus === PublicTemplateStatus.APPROVED_BY_RACA
    const defaultTemplate = noNeedReview ? this.noNeedReview : this.needReview

    const template = model.normalizeTemplate().clone({
      templateStatus: defaultTemplate.lookupKey,
      templateStatusInfo: defaultTemplate.convertToAdminResult()
    })

    this.dialogRef.close(
      this.oldProjectTemplate && this.oldProjectTemplate.templateId === template.templateId ? this.oldProjectTemplate : template
    )
  }

  isSaveDisabled(): boolean {
    return !this.table ? true : this.table && this.table.selection && this.table.selection.isEmpty()
  }

  private saveForImplementation(): void {
    of(this.table.selection.selected[0] as unknown as ProjectModel)
      .pipe(map(template => template.convertToImplementationTemplate()))
      .pipe(switchMap(template => this.projectImplementationService.validateTemplate(template.templateId, this.caseId)
        .pipe(catchError(_ => of(null)))
        .pipe(filter(val => !!val))
        .pipe(map(_ => template))
      ))
      .pipe(filter((value): value is ImplementationTemplate => !!value))
      .pipe(switchMap(selectedTemplate => this.projectImplementationService
        .openImplementationTemplateDialog(selectedTemplate)
        .onAfterClose$
        .pipe(filter(val => !!val))))
      .subscribe((result: ImplementationTemplate) => {
        this.dialogRef.close(result)
      });
  }
}
