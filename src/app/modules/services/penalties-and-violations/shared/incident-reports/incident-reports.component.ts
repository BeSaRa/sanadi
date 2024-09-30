import { Component, forwardRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { Subject, takeUntil, filter } from 'rxjs';
import { IncidenceReportPopupComponent } from '../../popups/incidence-report-popup/incidence-report-popup.component';

@Component({
    selector: 'incident-reports',
    templateUrl: 'incident-reports.component.html',
    styleUrls: ['incident-reports.component.scss'],
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => IncidentReportsComponent),
          multi: true
        }
      ]
})
export class IncidentReportsComponent implements ControlValueAccessor, OnInit, OnDestroy {

    lang= inject(LangService);
    dialog = inject(DialogService);
    readonly: boolean = false;


    value: string[] = [];
    destroy$ = new Subject<void>()
    displayedColumns:string[] = ['incidenceText','actions'];
    add$: Subject<any> = new Subject<any>();
    actions: IMenuItem<string>[] = [
        // view
        {
          type: 'action',
          label: 'view',
          icon: ActionIconsEnum.VIEW,
          onClick: (item: string) => this.viewItem(item),
          show: () => this.readonly
        },
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          onClick: (item: string,index) => this.editItem(item,index),
          show: () => !this.readonly
        },
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: string,index) => this.deleteItem(item,index),
          show: () => !this.readonly
        },
       
      ];

    onChange!: (value: string[]) => void
    onTouch!: () => void
    writeValue(value: string[]): void {
        this.value = value ?? []

    }

    registerOnChange(fn: (value: string[]) => void): void {
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
        this.add$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openAddDialog()
            })
    }

      openAddDialog() {
        this.dialog.show<IDialogData<string>>(IncidenceReportPopupComponent, {
          model: "",
          readonly:this.readonly,
          operation: OperationTypes.CREATE,
        }).onAfterClose$
          .pipe(takeUntil(this.destroy$))
          .pipe(filter((value: string): value is string => !!value))
          .subscribe((item) => {
            this.value = this.value.concat(item)
            this.onChange(this.value)
            this.onTouch()
          })
      }
    deleteItem(item: string, index: number) {
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

    editItem(item: string, index: number) {
        this.dialog.show<IDialogData<string>>(IncidenceReportPopupComponent, {
            model: item,
            operation: OperationTypes.UPDATE,

        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: string): value is string => !!value))
            .subscribe((updatedItem) => {
                this.value = this.value.map((item, i) => {
                    return i === index ? updatedItem : item
                })
                this.onChange(this.value)
                this.onTouch()
            })
    }
    viewItem(item: string) {
        this.dialog.show<IDialogData<string>>(IncidenceReportPopupComponent, {
            model: item,
            operation: OperationTypes.VIEW,
            readonly:this.readonly
        })
      }
}
