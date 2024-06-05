import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BannedPerson } from '@app/models/banned-person';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-table',
    templateUrl: 'banned-person-table.component.html',
    styleUrls: ['banned-person-table.component.scss']
})
export class BannedPersonTableComponent implements OnInit, OnDestroy {




    @Input() title:keyof ILanguageKeys  = 'menu_restricted'
    @Input()list$: BehaviorSubject<BannedPerson[]> = new BehaviorSubject<BannedPerson[]>([]);
    filterControl: UntypedFormControl = new UntypedFormControl('');
    @Input()reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    destroy$: Subject<void> = new Subject();
    @Input() displayedColumns:(keyof BannedPerson |'actions')[] =['registrationNo','documentType','name','nationality','internalUserId','actions']    ;
    @Input() actions: IMenuItem<BannedPerson>[] = [];
    @Input() reloadFn!:()=> Observable<BannedPerson[]>;
    @Input() allowReload: boolean = true;

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
            filter(_=>!!this.reloadFn),
            switchMap((_) => this.reloadFn()),
            tap(list => {
                this.list$.next(list);
            }),
            takeUntil(this.destroy$)
        )
            .subscribe()
    }
   
    
}

