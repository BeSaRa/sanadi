import { Component, computed, forwardRef, inject, Injector, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { PenaltyLegalBasisPopupComponent } from '../../popups/penalty-legal-basis-popup/penalty-legal-basis-popup.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { Subject, takeUntil, filter, tap } from 'rxjs';
import { LegalBasis } from '@app/models/legal-basis';
import { LegalBasisService } from '@app/services/legal-basis.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '@app/services/toast.service';

@Component({
    selector: 'penalty-legal-basis',
    templateUrl: 'penalty-legal-basis.component.html',
    styleUrls: ['penalty-legal-basis.component.scss'],
    providers: [
        {
            provide:NG_VALUE_ACCESSOR,
            useExisting:forwardRef(() => PenaltyLegalBasisComponent),
            multi:true,
        }
    ]
})
export class PenaltyLegalBasisComponent implements ControlValueAccessor, OnInit, OnDestroy {

    lang= inject(LangService);
    dialog = inject(DialogService);
    legalBasisService= inject(LegalBasisService);
    injector = inject(Injector);
    toast = inject(ToastService);
    readonly: boolean = false;


    value =  signal<number[]>([]) 
    LegalBasisList = toSignal( this.legalBasisService.loadActive(),{injector:this.injector})
    displayValue = computed(()=> this.LegalBasisList()?.filter(x=> this.value().includes(x.id)))
    destroy$ = new Subject<void>()
    displayedColumns:string[] = ['title','text','documentTitle','actions'];
    add$: Subject<any> = new Subject<any>();

    actions: IMenuItem<LegalBasis>[] = [
        // view
        {
          type: 'action',
          label: 'view',
          icon: ActionIconsEnum.VIEW,
          onClick: (item: LegalBasis) => this.viewItem(item.id),
          show: () => this.readonly
        },
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          onClick: (item: LegalBasis,index) => this.editItem(item.id,index),
          show: () => !this.readonly
        },
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: LegalBasis,index) => this.deleteItem(item.id),
          show: () => !this.readonly
        },
       
      ];

    onChange!: (value: number[]) => void
    onTouch!: () => void
    writeValue(value: number[]): void {
        this.value.set(value??[])

    }

    registerOnChange(fn: (value: number[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.readonly = isDisabled
    }   

    get dialogExtraData(){
        return {
            legalBasisList:this.LegalBasisList()
        }
    }
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
        this.dialog.show<IDialogData<number|null>>(PenaltyLegalBasisPopupComponent, {
          model: null,
          readonly:this.readonly,
          operation: OperationTypes.CREATE,
          extraData: this.dialogExtraData
        }).onAfterClose$
          .pipe(takeUntil(this.destroy$))
          .pipe(filter((value: number): value is number => !!value))
          .pipe(filter(value=>{
            if(this.value().includes(value)){
                this.toast.error(this.lang.map.msg_duplicated_item)
                return false
            }
            return true;
          }))
          .subscribe((item) => {
            this.value.update(list=>list.concat(item))
            this.onChange(this.value())
            this.onTouch()
          })
      }
    deleteItem(item: number) {
        this.dialog
            .confirm(this.lang.map.msg_confirm_delete_selected)
            .onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
            .subscribe(() => {
               this.value.update(list=>list.filter(x => x !== item))
                this.onChange(this.value())
                this.onTouch()
            })
    }

    editItem(id: number, index: number) {
        this.dialog.show<IDialogData<number>>(PenaltyLegalBasisPopupComponent, {
            model: id,
            operation: OperationTypes.UPDATE,
            extraData: this.dialogExtraData
        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: number): value is number => !!value))
            .pipe(filter(value=>{
                if(this.value().includes(value)){
                    this.toast.error(this.lang.map.msg_duplicated_item)
                    return false
                }
                return true;
              }))
            .subscribe((updatedItem) => {
                 this.value.update(list=>list.map((item, i) => {
                    return i === index ? updatedItem: item
                }))
                this.onChange(this.value())
                this.onTouch()
            })
    }
    viewItem(item: number) {
        this.dialog.show<IDialogData<number>>(PenaltyLegalBasisPopupComponent, {
            model: item,
            operation: OperationTypes.VIEW,
            readonly:this.readonly,
            extraData: this.dialogExtraData
        })
      }
}

