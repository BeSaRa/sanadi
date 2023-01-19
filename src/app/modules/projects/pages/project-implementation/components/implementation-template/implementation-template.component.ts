import {Component, EventEmitter, forwardRef, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from "rxjs";
import {LangService} from "@services/lang.service";
import {ProjectImplementationService} from "@services/project-implementation.service";
import {filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {TemplateCriteriaContract} from "@contracts/template-criteria-contract";
import {ProjectWorkArea} from "@app/enums/project-work-area";
import {ImplementationTemplate} from "@models/implementation-template";
import {DialogService} from "@services/dialog.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, UntypedFormControl} from "@angular/forms";

@Component({
  selector: 'implementation-template',
  templateUrl: './implementation-template.component.html',
  styleUrls: ['./implementation-template.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImplementationTemplateComponent),
      multi: true
    }
  ]
})
export class ImplementationTemplateComponent implements OnDestroy, OnInit, ControlValueAccessor {
  @Input()
  disabled: boolean = false;

  @Input()
  criteria!: () => TemplateCriteriaContract

  @Output()
  change: EventEmitter<ImplementationTemplate[]> = new EventEmitter<ImplementationTemplate[]>()

  destroy$: Subject<any> = new Subject<any>()
  addTemplate$: Subject<any> = new Subject();
  displayedColumns: string[] = ['templateName', 'templateCost', 'executionRegion', 'arabicName', 'englishName', 'region', 'beneficiaryRegion', 'location', 'projectCost', 'actions'];

  value: ImplementationTemplate[] = [];

  private _control: UntypedFormControl | undefined

  get control(): UntypedFormControl | undefined {
    return this._control
  }

  private onChange = (_value: ImplementationTemplate[]) => {
  }
  private onTouch = () => {
  }

  constructor(public lang: LangService,
              private injector: Injector,
              public dialog: DialogService,
              private service: ProjectImplementationService) {
  }

  writeValue(value: ImplementationTemplate[]): void {
    this.value = value
  }

  registerOnChange(fn: (value: ImplementationTemplate[]) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  ngOnInit(): void {
    this.listenToAddTemplate()
    Promise.resolve().then(() => {
      const ngControl = this.injector.get(NgControl, undefined, {
        optional: true
      })
      this._control = ngControl?.control as UntypedFormControl
    })
  }

  private getCriteria(criteria: TemplateCriteriaContract): TemplateCriteriaContract {
    return Object.keys(criteria).filter(key => !!criteria[key as keyof TemplateCriteriaContract]).reduce((acc, key) => {
      return {...acc, [key]: criteria[key as keyof TemplateCriteriaContract]}
    }, {} as TemplateCriteriaContract)

  }

  private listenToAddTemplate() {
    this.addTemplate$
      .pipe(filter(_ => !this.disabled))
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
      .pipe(tap(_ => this.onTouch()))
      .pipe(switchMap((dialogRef) => dialogRef.onAfterClose$.pipe(filter((template): template is ImplementationTemplate => !!template))))
      .subscribe((template) => {
        this.value = [template]
        this.change.next(this.value)
        this.onChange(this.value)
      })
  }

  openTemplateLocation(template: ImplementationTemplate) {
    template.openMap(true)
  }

  editTemplate(template: ImplementationTemplate) {
    if (this.disabled) return;
    template.edit()
      .onAfterClose$
      .pipe(filter((val): val is ImplementationTemplate => !!val))
      .subscribe((template) => {
        this.value = [template]
        this.onChange(this.value)
        this.change.emit(this.value)
      })
  }

  viewTemplate(template: ImplementationTemplate) {
    template.view()
  }

  removeTemplate(template: ImplementationTemplate) {
    if (this.disabled) return;
    this.dialog
      .confirm(this.lang.map.msg_delete_x_success.change({x: template.templateName}))
      .onAfterClose$
      .pipe(filter(v => v === UserClickOn.YES))
      .subscribe(() => {
        this.value = []
        this.onChange(this.value)
        this.change.emit(this.value)
      })
  }
}
