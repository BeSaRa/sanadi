import {Component, EventEmitter, forwardRef, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from "rxjs";
import {LangService} from "@services/lang.service";
import {ProjectImplementationService} from "@services/project-implementation.service";
import {filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {ImplementationCriteriaContract} from "@contracts/implementation-criteria-contract";
import {ImplementationTemplate} from "@models/implementation-template";
import {DialogService} from "@services/dialog.service";
import {UserClickOn} from "@enums/user-click-on.enum";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, UntypedFormControl} from "@angular/forms";
import {CustomValidators} from "@app/validators/custom-validators";
import {ServiceRequestTypes} from '@enums/service-request-types';
import {CommonUtils} from '@helpers/common-utils';

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
  caseId?: string
  @Input()
  requestType!: number

  @Input()
  criteria!: () => ImplementationCriteriaContract

  @Output()
  change: EventEmitter<ImplementationTemplate[]> = new EventEmitter<ImplementationTemplate[]>()

  destroy$: Subject<any> = new Subject<any>()
  addTemplate$: Subject<any> = new Subject();
  displayedColumns: string[] = ['templateName', 'templateCost', 'executionRegion', 'arabicName', 'englishName', 'region', 'beneficiaryRegion', 'location', 'projectCost', 'actions'];

  value: ImplementationTemplate[] = [];
  inputMaskPatterns = CustomValidators.inputMaskPatterns

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
    this.value = value ?? []
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

  private listenToAddTemplate() {
    this.addTemplate$
      .pipe(filter(_ => !this.disabled))
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.criteria()))
      .pipe(map(value => this.service.getCriteria(value)))
      .pipe(switchMap((criteria) => {
        return this.service.openDialogSearchTemplate(criteria, criteria.workArea!, this.requestType, this.caseId, undefined)
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
    if (this.disabled || this.isUpdateRequestType()) return;
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

  isUpdateRequestType(): boolean {
    return CommonUtils.isValidValue(this.requestType) && this.requestType === ServiceRequestTypes.UPDATE;
  }
}
