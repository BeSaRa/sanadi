import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LicenseActivity } from '@app/models/license-activity';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { LicenseActivityPopupComponent } from '../../popups/license-activity-popup/license-activity-popup.component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';

@Component({
    selector: 'license-activities',
    templateUrl: 'license-activities.component.html',
    styleUrls: ['license-activities.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LicenseActivitiesComponent),
            multi: true
        }
    ]
})
export class LicenseActivitiesComponent implements ControlValueAccessor, OnInit, OnDestroy {

    @Input()
    disabled: boolean = false;

    value: LicenseActivity[] = [];
    destroy$ = new Subject<void>()
    displayedColumns: string[] = ['activityName','activityDescription','actions'];
    addLicenseActivityDialog$: Subject<any> = new Subject<any>();
    actions: IMenuItem<LicenseActivity>[] = [
        // view
        {
          type: 'action',
          label: 'view',
          icon: ActionIconsEnum.VIEW,
          onClick: (item: LicenseActivity) => this.viewItem(item),
          show: () => this.disabled
        },
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          onClick: (item: LicenseActivity,index) => this.editItem(item,index),
          show: () => !this.disabled
        },
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: LicenseActivity,index) => this.deleteItem(item,index),
          show: () => !this.disabled
        },
       
      ];


    constructor(public lang: LangService,
        private dialog: DialogService) {


    }
    onChange!: (value: LicenseActivity[]) => void
    onTouch!: () => void
    writeValue(value: LicenseActivity[]): void {
        this.value = value ?? []

    }

    registerOnChange(fn: (value: LicenseActivity[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled
    }
    form: UntypedFormGroup = new UntypedFormGroup({})
   

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
        this.destroy$.subscribe()
    }

    ngOnInit(): void {
        this.listenToAdd()
    }

    listenToAdd() {
        this.addLicenseActivityDialog$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openAddDialog()
            })
    }

      openAddDialog() {
        this.dialog.show<IDialogData<LicenseActivity>>(LicenseActivityPopupComponent, {
          model: new LicenseActivity(),
          readonly:this.disabled,
          operation: OperationTypes.CREATE,
        }).onAfterClose$
          .pipe(takeUntil(this.destroy$))
          .pipe(filter((value: LicenseActivity): value is LicenseActivity => !!value))
          .subscribe((item) => {
            this.value = this.value.concat(item)
            this.onChange(this.value)
            this.onTouch()
          })
      }
    deleteItem(item: LicenseActivity, index: number) {
        this.dialog
            .confirm(this.lang.map.msg_confirm_delete_selected)
            .onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
            .subscribe(() => {
                this.value = this.value.filter(x => x !== item)
                this.onChange(this.value)
                this.onTouch()
            })
    }

    editItem(item: LicenseActivity, index: number) {
        this.dialog.show<IDialogData<LicenseActivity>>(LicenseActivityPopupComponent, {
            model: new LicenseActivity().clone( item),
            operation: OperationTypes.UPDATE,

        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: LicenseActivity): value is LicenseActivity => !!value))
            .subscribe((updatedItem) => {
                this.value = this.value.map((item, i) => {
                    return i === index ? new LicenseActivity().clone(updatedItem) : item
                })
                this.onChange(this.value)
                this.onTouch()
            })
    }
    viewItem(item: LicenseActivity) {
        this.dialog.show<IDialogData<LicenseActivity>>(LicenseActivityPopupComponent, {
            model: new LicenseActivity().clone(item),
            operation: OperationTypes.VIEW,
            readonly:this.disabled
        })
      }
}
