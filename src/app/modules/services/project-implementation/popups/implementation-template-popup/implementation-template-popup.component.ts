import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from "@services/lang.service";
import {ImplementationTemplate} from "@models/implementation-template";
import {Subject} from "rxjs";
import {AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {debounceTime, map, takeUntil} from "rxjs/operators";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {ICoordinates} from "@contracts/ICoordinates";
import {DialogService} from "@services/dialog.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {CustomValidators} from "@app/validators/custom-validators";

@Component({
  selector: 'implementation-template-popup',
  templateUrl: './implementation-template-popup.component.html',
  styleUrls: ['./implementation-template-popup.component.scss']
})
export class ImplementationTemplatePopupComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>()
  public template: ImplementationTemplate
  public form!: UntypedFormGroup
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  readonly = false;

  constructor(public lang: LangService,
              private dialog: DialogService,
              private dialogRef: DialogRef,
              private fb: UntypedFormBuilder,
              @Inject(DIALOG_DATA_TOKEN)
                data: { template: ImplementationTemplate, readonly: boolean }) {
    this.template = data.template
    this.readonly = data.readonly
  }

  get latitude(): AbstractControl {
    return this.form.get('latitude')!
  }

  get longitude(): AbstractControl {
    return this.form.get('longitude')!
  }

  get projectTotalCost(): AbstractControl {
    return this.form.get('projectTotalCost')!
  }

  ngOnInit(): void {
    this.buildForm()
    //this.listenToCostChanges()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  private buildForm() {
    this.form = this.fb.group(this.template.buildForm(true))
  }

  openMapMarker() {
    this.template.openMap()
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({click, value}: { click: UserClickOn, value: ICoordinates }) => {
        if (click === UserClickOn.YES) {
          this.template!.latitude = value.latitude;
          this.template!.longitude = value.longitude;
          this.latitude.patchValue(value.latitude);
          this.longitude.patchValue(value.longitude);
        }
      })
  }

  close(): void {
    this.dialogRef.close(undefined)
  }

  save() {
    if (this.readonly) return;

    if (this.form.invalid) {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)
      return
    }
    const model = new ImplementationTemplate().clone({
      ...this.template,
      ...this.form.getRawValue(),
    })
    if(!this.englishNameControl.value){
      model.arabicName = model.templateName;
      model.englishName = model.templateName;
    }else{
      model.arabicName = model.englishName
    }
    console.log(model);
    
    this.dialogRef.close(model)
  }
  get englishNameControl(): UntypedFormControl {
    return this.form.get('englishName') as UntypedFormControl;
}
  // private listenToCostChanges() {
  //   this.projectTotalCost
  //     .valueChanges
  //     .pipe(takeUntil(this.destroy$))
  //     .pipe(map(value => Number(value)))
  //     .pipe(debounceTime(250))
  //     .subscribe((value: number) => {
  //       this.template.setProjectTotalCost(value)
  //       this.projectTotalCost.patchValue(value, {emitEvent: false})
  //     })
  // }
}
