import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BannedPersonTerrorism } from '@app/models/BannedPersonTerrorism';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-terrorism-table',
    templateUrl: 'banned-person-terrorism-table.component.html',
    styleUrls: ['banned-person-terrorism-table.component.scss']
})
export class BannedPersonTerrorismTableComponent implements OnInit, OnDestroy {
    approveAll() {
        this.list$.pipe(
            tap(list=>this.approved.emit(list[0].requestFullSerial)),
            take(1)
        )
        .subscribe();
    }
    @Input() title: keyof ILanguageKeys = 'menu_restricted'
    @Input() list$: BehaviorSubject<BannedPersonTerrorism[]> = new BehaviorSubject<BannedPersonTerrorism[]>([]);
    filterControl: UntypedFormControl = new UntypedFormControl('');
    @Input() reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    destroy$: Subject<void> = new Subject();
    @Input() displayedColumns: (keyof BannedPersonTerrorism | 'actions')[] = ['requestFullSerial', 'registrationNo', 'documentType', 'documentNumber', 'name', 'nationality']
    @Input() actions: IMenuItem<BannedPersonTerrorism>[] = [];
    @Input() reloadFn!: () => Observable<BannedPersonTerrorism[]>;
    @Input() allowReload: boolean = true;
    @Output() approved: EventEmitter<string> = new EventEmitter();

    lang = inject(LangService);


    constructor() {

    }
    ngOnInit(): void {
        this._listenToReload();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }


    private _listenToReload() {
        this.reload$.pipe(
            filter(_ => !!this.reloadFn),
            switchMap((_) => this.reloadFn()),
            tap(list => {
                this.list$.next(list);
            }),
            takeUntil(this.destroy$)
        )
            .subscribe()
    }


}
