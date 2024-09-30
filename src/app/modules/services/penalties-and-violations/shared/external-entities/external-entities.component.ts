import { Component, forwardRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ExternalEntity } from '@app/models/external-entity';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { Subject, takeUntil, filter } from 'rxjs';
import { ExternalEntityPopupComponent } from '../../popups/external-entity-popup/external-entity-popup.component';

@Component({
    selector: 'external-entities',
    templateUrl: 'external-entities.component.html',
    styleUrls: ['external-entities.component.scss'],
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => ExternalEntitiesComponent),
          multi: true
        }
      ]
})
export class ExternalEntitiesComponent implements ControlValueAccessor, OnInit, OnDestroy {

    lang= inject(LangService);
    dialog = inject(DialogService);
    @Input()
    readonly: boolean = false;


    value: ExternalEntity[] = [];
    destroy$ = new Subject<void>()
    displayedColumns: (keyof ExternalEntity| 'actions')[] = ['identificationNumber','arabicName','englishName','actions'];
    addExternalEntityDialog$: Subject<any> = new Subject<any>();
    actions: IMenuItem<ExternalEntity>[] = [
        // view
        {
          type: 'action',
          label: 'view',
          icon: ActionIconsEnum.VIEW,
          onClick: (item: ExternalEntity) => this.viewItem(item),
          show: () => this.readonly
        },
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          onClick: (item: ExternalEntity,index) => this.editItem(item,index),
          show: () => !this.readonly
        },
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: ExternalEntity,index) => this.deleteItem(item,index),
          show: () => !this.readonly
        },
       
      ];

    onChange!: (value: ExternalEntity[]) => void
    onTouch!: () => void
    writeValue(value: ExternalEntity[]): void {
        this.value = value ?? []

    }

    registerOnChange(fn: (value: ExternalEntity[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.readonly = isDisabled
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
        this.addExternalEntityDialog$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openAddDialog()
            })
    }

      openAddDialog() {
        this.dialog.show<IDialogData<ExternalEntity>>(ExternalEntityPopupComponent, {
          model: new ExternalEntity(),
          readonly:this.readonly,
          operation: OperationTypes.CREATE,
        }).onAfterClose$
          .pipe(takeUntil(this.destroy$))
          .pipe(filter((value: ExternalEntity): value is ExternalEntity => !!value))
          .subscribe((item) => {
            this.value = this.value.concat(item)
            this.onChange(this.value)
            this.onTouch()
          })
      }
    deleteItem(item: ExternalEntity, index: number) {
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

    editItem(item: ExternalEntity, index: number) {
        this.dialog.show<IDialogData<ExternalEntity>>(ExternalEntityPopupComponent, {
            model: new ExternalEntity().clone( item),
            operation: OperationTypes.UPDATE,

        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: ExternalEntity): value is ExternalEntity => !!value))
            .subscribe((updatedItem) => {
                this.value = this.value.map((item, i) => {
                    return i === index ? new ExternalEntity().clone(updatedItem) : item
                })
                this.onChange(this.value)
                this.onTouch()
            })
    }
    viewItem(item: ExternalEntity) {
        this.dialog.show<IDialogData<ExternalEntity>>(ExternalEntityPopupComponent, {
            model: new ExternalEntity().clone(item),
            operation: OperationTypes.VIEW,
            readonly:this.readonly
        })
      }
}
