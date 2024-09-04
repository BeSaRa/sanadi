import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { ExternalCharityFounderPopupComponent } from '@app/external-charity/popups/external-charity-founder-popup/external-charity-founder-popup.component';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ExternalCharityFounder } from '@app/models/external-charity-founder';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { Subject, takeUntil, filter } from 'rxjs';

@Component({
    selector: 'founders',
    templateUrl: 'founders.component.html',
    styleUrls: ['founders.component.scss'],
    providers:[
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FoundersComponent),
            multi: true
        }
    ]
})
export class FoundersComponent implements ControlValueAccessor, OnInit, OnDestroy {

    @Input()
    disabled: boolean = false;

    value: ExternalCharityFounder[] = [];
    destroy$ = new Subject<void>()
    displayedColumns: (keyof ExternalCharityFounder|'actions')[] =
     ['founderName','founderIdentifierId','founderPosition','founderJob','actions'];
    add$: Subject<any> = new Subject<any>();
    actions: IMenuItem<ExternalCharityFounder>[] = [
        // view
        {
          type: 'action',
          label: 'view',
          icon: ActionIconsEnum.VIEW,
          onClick: (item: ExternalCharityFounder) => this.viewItem(item),
          show: () => this.disabled
        },
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          onClick: (item: ExternalCharityFounder,index) => this.editItem(item,index),
          show: () => !this.disabled
        },
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: ExternalCharityFounder,index) => this.deleteItem(item,index),
          show: () => !this.disabled
        },
       
      ];


    constructor(public lang: LangService,
        private dialog: DialogService) {


    }
    onChange! : (value: ExternalCharityFounder[]) => void
    onTouch!: () => void
    writeValue(value: ExternalCharityFounder[]): void {
        this.value = value ?? []

    }

    registerOnChange(fn: (value: ExternalCharityFounder[]) => void): void {
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
        this.add$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openAddDialog()
            })
    }

      openAddDialog() {
        this.dialog.show<IDialogData<ExternalCharityFounder>>(ExternalCharityFounderPopupComponent, {
          model: new ExternalCharityFounder(),
          readonly:this.disabled,
          operation: OperationTypes.CREATE,
        }).onAfterClose$
          .pipe(takeUntil(this.destroy$))
          .pipe(filter((value: ExternalCharityFounder): value is ExternalCharityFounder => !!value))
          .subscribe((item) => {
            this.value = this.value.concat(item)
            this.onChange(this.value)
            this.onTouch()
          })
      }
    deleteItem(item: ExternalCharityFounder, index: number) {
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

    editItem(item: ExternalCharityFounder, index: number) {
        this.dialog.show<IDialogData<ExternalCharityFounder>>(ExternalCharityFounderPopupComponent, {
            model: new ExternalCharityFounder().clone( item),
            operation: OperationTypes.UPDATE,

        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: ExternalCharityFounder): value is ExternalCharityFounder => !!value))
            .subscribe((updatedItem) => {
                this.value = this.value.map((item, i) => {
                    return i === index ? new ExternalCharityFounder().clone(updatedItem) : item
                })
                this.onChange(this.value)
                this.onTouch()
            })
    }
    viewItem(item: ExternalCharityFounder) {
        this.dialog.show<IDialogData<ExternalCharityFounder>>(ExternalCharityFounderPopupComponent, {
            model: new ExternalCharityFounder().clone(item),
            operation: OperationTypes.VIEW,
            readonly:this.disabled
        })
      }
}
