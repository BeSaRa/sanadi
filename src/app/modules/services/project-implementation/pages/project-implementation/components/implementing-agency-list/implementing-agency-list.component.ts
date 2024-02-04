import {Component, EventEmitter, forwardRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, UntypedFormControl} from "@angular/forms";
import {combineLatest, Subject} from "rxjs";
import {ImplementingAgency} from "@models/implementing-agency";
import {ImplementingAgencyTypes} from "@enums/implementing-agency-types.enum";
import {filter, switchMap, takeUntil, tap} from "rxjs/operators";
import {CommonService} from "@services/common.service";
import {LangService} from '@services/lang.service';
import {AdminResult} from "@models/admin-result";
import {DialogService} from "@services/dialog.service";
import {UserClickOn} from "@enums/user-click-on.enum";

@Component({
  selector: 'implementing-agency-list',
  templateUrl: './implementing-agency-list.component.html',
  styleUrls: ['./implementing-agency-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImplementingAgencyListComponent),
      multi: true
    },
  ]
})
export class ImplementingAgencyListComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>()
  public value: ImplementingAgency[] = [];
  private type$: Subject<ImplementingAgencyTypes> = new Subject<ImplementingAgencyTypes>()
  private country$: Subject<number> = new Subject()
  public selectedAgency: UntypedFormControl = new UntypedFormControl()
  private ides: string[] = [];
  agencies :AdminResult[] =[];
  _= combineLatest([this.type$, this.country$])
  .pipe(takeUntil(this.destroy$))
  .pipe(switchMap(([type, country]) => {
    return this.commonService.loadProjectAgencies(type, country)
  }))
  .pipe(tap((list)=>{
    this.agencies = list;
    !!(list && list.length === 1 && (this.value??[]).length === 0 && (this.selectedAgency.setValue(list[0])))
    this.addSelectedAgency()
  })).subscribe()

  @Input()
  disabled: boolean = false;

  @Input()
  set type(value: ImplementingAgencyTypes) {
    this.type$.next(value)
  }

  @Input()
  set country(value: number|undefined) {
    if(!!value){
      this.country$.next(value)
    }
  }

  change: EventEmitter<ImplementingAgency[]> = new EventEmitter<ImplementingAgency[]>()
  onChange!: (_value: ImplementingAgency[]) => void
  onTouch!: () => void
  displayedColumns: string[] = ['arName', 'enName', 'actions'];
  control?: FormControl;

  constructor(private commonService: CommonService,
              private dialog: DialogService,
              private injector: Injector,
              public lang: LangService) {
  }

  ngOnInit(): void {
    Promise.resolve().then(() => {
      const ctrl = this.injector.get(NgControl, null, {optional: true})
      this.control = (ctrl?.control as FormControl) || undefined
    })
   
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  writeValue(value: ImplementingAgency[]): void {
    this.value = value || [];
    this.updateIds()
  }

  registerOnChange(fn: (value: ImplementingAgency[]) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  addSelectedAgency() {
    if (this.disabled || !this.selectedAgency.value) return;

    const selectedAgency = this.selectedAgency.value as AdminResult;
    const agency = new ImplementingAgency().clone({
      implementingAgency: selectedAgency.fnId,
      implementingAgencyType: selectedAgency.parent,
      implementingAgencyInfo: selectedAgency
    })
    this.value = (this.value??[]).concat(agency)
    this.change.emit(this.value)
    this.onChange(this.value)
    this.onTouch()
    this.selectedAgency.setValue(null)
    this.updateIds()
  }

  deleteAgency(item: ImplementingAgency) {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: item.implementingAgencyInfo.getName()}))
      .onAfterClose$
      .pipe(filter((value): value is UserClickOn => value === UserClickOn.YES))
      .subscribe(() => {
        this.value = this.value.filter(i => i.implementingAgency !== item.implementingAgency)
        this.onChange(this.value)
        this.onTouch()
        this.updateIds()
      })
  }

  private updateIds() {
    this.ides = (this.value ?? []).map(item => item.implementingAgency)
  }

  isExists(item: AdminResult): boolean {
    return this.ides.includes(item.fnId!)
  }
}
