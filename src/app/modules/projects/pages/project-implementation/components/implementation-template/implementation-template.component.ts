import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ProjectImplementation} from "@models/project-implementation";
import {Subject} from "rxjs";
import {LangService} from "@services/lang.service";
import {ProjectImplementationService} from "@services/project-implementation.service";
import {filter, map, switchMap, takeUntil} from "rxjs/operators";
import {TemplateCriteriaContract} from "@contracts/template-criteria-contract";
import {ProjectWorkArea} from "@app/enums/project-work-area";
import {ImplementationTemplate} from "@models/implementation-template";
import {DialogService} from "@services/dialog.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";

@Component({
  selector: 'implementation-template',
  templateUrl: './implementation-template.component.html',
  styleUrls: ['./implementation-template.component.scss']
})
export class ImplementationTemplateComponent implements OnDestroy, OnInit {
  @Input()
  model!: ProjectImplementation
  @Input()
  readonly: boolean = false;

  @Input()
  criteria!: () => TemplateCriteriaContract

  @Output()
  templateChange: EventEmitter<ImplementationTemplate | undefined> = new EventEmitter<ImplementationTemplate | undefined>()

  destroy$: Subject<any> = new Subject<any>()
  addTemplate$: Subject<any> = new Subject();
  displayedColumns: string[] = ['templateName', 'templateCost', 'executionRegion', 'arabicName', 'englishName', 'region', 'beneficiaryRegion', 'location', 'projectCost', 'actions'];

  constructor(public lang: LangService,
              public dialog: DialogService,
              private service: ProjectImplementationService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  ngOnInit(): void {
    this.listenToAddTemplate()
  }

  private getCriteria(criteria: TemplateCriteriaContract): TemplateCriteriaContract {
    return Object.keys(criteria).filter(key => !!criteria[key as keyof TemplateCriteriaContract]).reduce((acc, key) => {
      return {...acc, [key]: criteria[key as keyof TemplateCriteriaContract]}
    }, {} as TemplateCriteriaContract)

  }

  private listenToAddTemplate() {
    this.addTemplate$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.criteria()))
      .pipe(map(value => this.getCriteria(value)))
      .pipe(switchMap((_criteria) => {
        const demo = {
          countries: [231],
          domain: 1,
          mainUNOCHA: 1
        }
        return this.service.openDialogSearchTemplate(demo, /*criteria.workArea!*/ ProjectWorkArea.OUTSIDE_QATAR)
      }))
      .pipe(switchMap((dialogRef) => dialogRef.onAfterClose$.pipe(filter((template): template is ImplementationTemplate => !!template))))
      .subscribe((template) => {
        this.model && this.model.setImplementationTemplate(template)
        this.templateChange.next(template)
      })
  }

  openTemplateLocation(template: ImplementationTemplate) {
    template.openMap(true)
  }

  editTemplate(template: ImplementationTemplate) {
    template.edit()
      .onAfterClose$
      .pipe(filter((val): val is ImplementationTemplate => !!val))
      .subscribe((template) => {
        this.templateChange.emit(template)
      })
  }

  viewTemplate(template: ImplementationTemplate) {
    template.view()
  }

  removeTemplate(template: ImplementationTemplate) {
    this.dialog
      .confirm(this.lang.map.msg_delete_x_success.change({x: template.templateName}))
      .onAfterClose$
      .pipe(filter(v => v === UserClickOn.YES))
      .subscribe(() => {
        this.model.removeImplementationTemplate()
        this.templateChange.emit(undefined)
      })
  }
}
