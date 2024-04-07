import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { InspectionSpecialist } from '@app/models/inspection-specialist';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
import { InspectionSpecialistsPopupComponent } from '../../popups/inspection-specialists-popup/inspection-specialists-popup.component';
import { InternalUserService } from '@app/services/internal-user.service';
import { InternalUser } from '@app/models/internal-user';
import { ExternalSpecialistPopupComponent } from '../../popups/external-specialist-popup/external-specialist-popup.component';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
    selector: 'inspection-specialists',
    templateUrl: 'inspection-specialists.component.html',
    styleUrls: ['inspection-specialists.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InspectionSpecialistsComponent),
            multi: true
        }
    ]
})
export class InspectionSpecialistsComponent implements ControlValueAccessor, OnInit, OnDestroy {

    @Input()
    disabled: boolean = false;

    value: InspectionSpecialist[] = [];
    internalSpecialists: InternalUser[] = [];
    externalSpecialists: InspectionSpecialist[] = [];
    destroy$ = new Subject<void>()
    displayedColumns: string[] = ['arName', 'enName', 'actions'];
    externalSpecialistColumns: string[] = ['externalSpecialistName', 'externalSpecialistEntity', 'externalSpecialistAdjective', 'actions'];
    addInternalSpecialistDialog$: Subject<any> = new Subject<any>();
    addExternalSpecialistDialog$: Subject<any> = new Subject<any>();


    constructor(public lang: LangService,
        private dialog: DialogService,
        private internalUserService: InternalUserService) {


    }

    internalActions: IMenuItem<InternalUser>[] = [
          
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: InternalUser,index) => this.deleteInternalSpecialist(item,index),
          show: () => !this.disabled
        },
        
      ];
    externalActions: IMenuItem<InspectionSpecialist>[] = [
        // view
        {
          type: 'action',
          label: 'view',
          icon: ActionIconsEnum.VIEW,
          onClick: (item: InspectionSpecialist,index) => this.viewItem(item,index),
          show: () => this.disabled
        },
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          onClick: (item: InspectionSpecialist,index) => this.editItem(item,index),
          show: () => !this.disabled
        },
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: InspectionSpecialist,index) => this.deleteExternalSpecialist(item,index),
          show: () => !this.disabled
        },
        
      ];
    onChange!: (value: InspectionSpecialist[]) => void
    onTouch!: () => void
    writeValue(value: InspectionSpecialist[]): void {
        this.internalSpecialists = []
        this.externalSpecialists = []
        this.value = value ?? []
        this.value.forEach(item=>{
            if(!!item.internalSpecialist){
                this.internalSpecialists = this.internalSpecialists.concat(item.internalSpecialist)
            }
            else{
                this.externalSpecialists = this.externalSpecialists.concat(item)
            }
        })
    }

    registerOnChange(fn: (value: InspectionSpecialist[]) => void): void {
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
       
        this.listenToAddInternalSpecialist();
        this.listenToAddExternalSpecialist();
    }
    listenToAddExternalSpecialist() {
        this.addExternalSpecialistDialog$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openAddExternalSpecialistDialog()
            })
    }
    openAddExternalSpecialistDialog() {
        this.dialog.show<IDialogData<InspectionSpecialist>>(ExternalSpecialistPopupComponent, {
            model: new InspectionSpecialist(),
            readonly: this.disabled,
            operation: OperationTypes.CREATE,
        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: InspectionSpecialist): value is InspectionSpecialist => !!value))
            .subscribe((item) => {
                this.value = this.value.concat(item)
                this.externalSpecialists = this.externalSpecialists.concat(item)
                this.onChange(this.value)
                this.onTouch()
            })
    }

    listenToAddInternalSpecialist() {
        this.addInternalSpecialistDialog$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openAddInternalSpecialistDialog()
            })
    }

    openAddInternalSpecialistDialog() {
        this.internalUserService.getAllActive().pipe(
            take(1),
            switchMap(users => {
                return this.dialog.show<IDialogData<InspectionSpecialist>>(InspectionSpecialistsPopupComponent, {
                    model: new InspectionSpecialist(),
                    readonly: this.disabled,
                    users: users,
                    operation: OperationTypes.CREATE,
                }).onAfterClose$
                    .pipe(takeUntil(this.destroy$))
                    .pipe(filter((value: InspectionSpecialist): value is InspectionSpecialist => !!value))
            })
        ).subscribe((item) => {
            this.value = this.value.concat(item)
            this.internalSpecialists = this.internalSpecialists.concat(item.internalSpecialist)
            this.onChange(this.value)
            this.onTouch()
        })
    }
    deleteInternalSpecialist(item: InternalUser, index: number) {
        this.dialog
            .confirm(this.lang.map.msg_confirm_delete_selected)
            .onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
            .subscribe(() => {
                this.value = this.value.filter(x => x.internalSpecialist !== item)
                this.internalSpecialists = this.internalSpecialists.filter(x => x !== item)


                this.onChange(this.value)
                this.onTouch()
            })
    }
    deleteExternalSpecialist(item: InspectionSpecialist, index: number) {
        this.dialog
            .confirm(this.lang.map.msg_confirm_delete_selected)
            .onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
            .subscribe(() => {
                this.value = this.value.filter(x => x !== item)

                this.externalSpecialists = this.externalSpecialists.filter(x => x !== item)

                this.onChange(this.value)
                this.onTouch()
            })
    }

    editItem(item: InspectionSpecialist, index: number) {
        this.dialog.show<IDialogData<InspectionSpecialist>>(ExternalSpecialistPopupComponent, {
            model: new InspectionSpecialist().clone(item),
            readonly: false,
            operation: OperationTypes.UPDATE,
        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: InspectionSpecialist): value is InspectionSpecialist => !!value))
            .subscribe((updatedItem) => {
                const itemIndex = this.value.indexOf(item)
                this.value = this.value.map((item, i) => {
                    return i === itemIndex ? new InspectionSpecialist().clone(updatedItem) : item
                })
                this.externalSpecialists = this.externalSpecialists.map((item, i) => {
                    return i === index ? new InspectionSpecialist().clone(updatedItem) : item
                })
                this.onChange(this.value)
                this.onTouch()
            })
    }
    viewItem(item: InspectionSpecialist, index: number) {
        this.dialog.show<IDialogData<InspectionSpecialist>>(ExternalSpecialistPopupComponent, {
            model: new InspectionSpecialist().clone(item),
            readonly: true,
            operation: OperationTypes.VIEW,
        })
    }
    
}
