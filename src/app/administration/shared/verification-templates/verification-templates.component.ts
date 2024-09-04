import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormGroup } from '@angular/forms';
import { VerificationTemplatePopupComponent } from '@app/administration/popups/verification-template-popup/verification-template-popup.component';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { VerificationTemplate } from '@app/models/verification-template';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'verification-templates',
    templateUrl: 'verification-templates.component.html',
    styleUrls: ['verification-templates.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => VerificationTemplatesComponent),
            multi: true
        }
    ]
})
export class VerificationTemplatesComponent implements ControlValueAccessor, OnInit, OnDestroy {

    @Input()
    disabled: boolean = false;

    value: VerificationTemplate[] = [];
    destroy$ = new Subject<void>()
    displayedColumns: string[] = ['verification','actions'];
    addVerificationTemplateDialog$: Subject<any> = new Subject<any>();
    actions: IMenuItem<VerificationTemplate>[] = [
        // view
        {
          type: 'action',
          label: 'view',
          icon: ActionIconsEnum.VIEW,
          onClick: (item: VerificationTemplate) => this.viewItem(item),
          show: () => this.disabled
        },
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          onClick: (item: VerificationTemplate,index) => this.editItem(item,index),
          show: () => !this.disabled
        },
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: VerificationTemplate,index) => this.deleteItem(item,index),
          show: () => !this.disabled
        },
       
      ];


    constructor(public lang: LangService,
        private dialog: DialogService) {


    }
    onChange!: (value: VerificationTemplate[]) => void
    onTouch!: () => void
    writeValue(value: VerificationTemplate[]): void {
        this.value = value ?? []

    }

    registerOnChange(fn: (value: VerificationTemplate[]) => void): void {
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
        this.destroy$.unsubscribe()
    }

    ngOnInit(): void {
        this.listenToAdd()
    }

    listenToAdd() {
        this.addVerificationTemplateDialog$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openAddDialog()
            })
    }

      openAddDialog() {
        this.dialog.show<IDialogData<VerificationTemplate>>(VerificationTemplatePopupComponent, {
          model: new VerificationTemplate(),
          readonly:this.disabled,
          operation: OperationTypes.CREATE,
        }).onAfterClose$
          .pipe(takeUntil(this.destroy$))
          .pipe(filter((value: VerificationTemplate): value is VerificationTemplate => !!value))
          .subscribe((item) => {
            this.value = this.value.concat(item)
            this.onChange(this.value)
            this.onTouch()
          })
      }
    deleteItem(item: VerificationTemplate, index: number) {
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

    editItem(item: VerificationTemplate, index: number) {
        this.dialog.show<IDialogData<VerificationTemplate>>(VerificationTemplatePopupComponent, {
            model: new VerificationTemplate().clone( item),
            operation: OperationTypes.UPDATE,

        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: VerificationTemplate): value is VerificationTemplate => !!value))
            .subscribe((updatedItem) => {
                this.value = this.value.map((item, i) => {
                    return i === index ? new VerificationTemplate().clone(updatedItem) : item
                })
                this.onChange(this.value)
                this.onTouch()
            })
    }
    viewItem(item: VerificationTemplate) {
        this.dialog.show<IDialogData<VerificationTemplate>>(VerificationTemplatePopupComponent, {
            model: new VerificationTemplate().clone(item),
            operation: OperationTypes.VIEW,
            readonly:this.disabled
        })
      }
}

