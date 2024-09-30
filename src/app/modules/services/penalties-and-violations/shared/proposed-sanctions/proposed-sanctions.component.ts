import { Component, forwardRef, inject, Injector, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ProposedSanction } from '@app/models/proposed-sanction';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { PenaltyService } from '@app/services/penalty.service';
import { ToastService } from '@app/services/toast.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { ProposedSanctionsPopupComponent } from '../../popups/proposed-sanctions-popup/proposed-sanctions-popup.component';

@Component({
    selector: 'proposed-sanctions',
    templateUrl: 'proposed-sanctions.component.html',
    styleUrls: ['proposed-sanctions.component.scss'],
    providers:[
        {
            provide:NG_VALUE_ACCESSOR,
            useExisting:forwardRef(()=>ProposedSanctionsComponent),
            multi:true
        }
    ]
})
export class ProposedSanctionsComponent implements ControlValueAccessor, OnInit, OnDestroy {

    lang= inject(LangService);
    dialog = inject(DialogService);
    penaltyService= inject(PenaltyService);
    injector = inject(Injector);
    toast = inject(ToastService);
    @Input()
    readonly: boolean = false;


    value =  signal<ProposedSanction[]>([]) 
    PenaltyList = toSignal( this.penaltyService.loadActive(),{injector:this.injector})
    destroy$ = new Subject<void>()
    displayedColumns:string[] = ['name','sanctionComment','actions'];
    add$: Subject<any> = new Subject<any>();

    actions: IMenuItem<ProposedSanction>[] = [
        // view
        {
          type: 'action',
          label: 'view',
          icon: ActionIconsEnum.VIEW,
          onClick: (item: ProposedSanction) => this.viewItem(item),
          show: () => this.readonly
        },
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          onClick: (item: ProposedSanction,index) => this.editItem(item,index),
          show: () => !this.readonly
        },
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: ProposedSanction) => this.deleteItem(item),
          show: () => !this.readonly
        },
       
      ];

    onChange!: (value: ProposedSanction[]) => void
    onTouch!: () => void
    writeValue(value: ProposedSanction[]): void {
        this.value.set(value??[])

    }

    registerOnChange(fn: (value: ProposedSanction[]) => void): void {
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
            penaltyList:this.PenaltyList()
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
        this.dialog.show<IDialogData<ProposedSanction>>(ProposedSanctionsPopupComponent, {
          model: new ProposedSanction(),
          readonly:this.readonly,
          operation: OperationTypes.CREATE,
          extraData: this.dialogExtraData
        }).onAfterClose$
          .pipe(takeUntil(this.destroy$))
          .pipe(filter((value: ProposedSanction): value is ProposedSanction => !!value))
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
    deleteItem(item: ProposedSanction) {
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

    editItem(id: ProposedSanction, index: number) {
        this.dialog.show<IDialogData<ProposedSanction>>(ProposedSanctionsPopupComponent, {
            model: id,
            operation: OperationTypes.UPDATE,
            extraData: this.dialogExtraData
        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: ProposedSanction): value is ProposedSanction => !!value))
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
    viewItem(item: ProposedSanction) {
        this.dialog.show<IDialogData<ProposedSanction>>(ProposedSanctionsPopupComponent, {
            model: item,
            operation: OperationTypes.VIEW,
            readonly:this.readonly,
            extraData: this.dialogExtraData
        })
      }
}


