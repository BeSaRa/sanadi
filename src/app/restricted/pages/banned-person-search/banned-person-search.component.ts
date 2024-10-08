import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { BannedSearch } from '@app/enums/banned-search-enum';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { BannedPersonTerrorism } from '@app/models/BannedPersonTerrorism';
import { BannedPerson } from '@app/models/banned-person';
import { BannedPersonSearch } from "@app/models/banned-person-search";
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { BannedPersonService } from '@app/services/banned-person.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, scan, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-search',
    templateUrl: 'banned-person-search.component.html',
    styleUrls: ['banned-person-search.component.scss']
})
export class BannedPersonSearchComponent implements OnInit, OnDestroy {



    fb = inject(FormBuilder);
    lang = inject(LangService);
    bannedPersonService = inject(BannedPersonService);
    lookupService = inject(LookupService);
    dialog = inject(DialogService);
    employeeService=inject(EmployeeService);

    bannedPersonList$ = new BehaviorSubject<BannedPerson[]>([]);
    bannedPersonTerrorismList$ = new BehaviorSubject<BannedPersonTerrorism[]>([]);
    destroy$:Subject<void> = new Subject<void>();
    requestType$ = new BehaviorSubject<number|null>(null);
    search$ = new Subject<Partial<BannedPersonSearch>>();
    racaSearch$ = new Subject<Partial<BannedPersonSearch>>();
    moiSearch$ = new Subject<Partial<BannedPersonSearch>>();


    requestTypes = this.lookupService.listByCategory.BannedSearch
    form!: UntypedFormGroup;

    requestTypeControl = new UntypedFormControl(null, [CustomValidators.required]);
    showMOI$ = this.requestTypeControl.valueChanges
        .pipe(
            scan((_, value) => value === 2, false),
            startWith(false),
            takeUntil(this.destroy$)
        );
    ngOnInit(): void {
        this._buildInquiryForms();
        this._listenToRequestTypeChange();
        this._listenToSearch();
        this._listenToRACASearch();
        this._listenToMOISearch();
        this._handleSearchPermissions();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }

    actions: IMenuItem<BannedPerson>[] =
        [
            // view
            {
                type: 'action',
                icon: ActionIconsEnum.VIEW,
                label: 'view',
                onClick: (item: BannedPerson) => this._view(item),
            },
               // logs
          {
            type: 'action',
            icon: ActionIconsEnum.LOGS,
            label: 'logs',
            onClick: (item: BannedPerson) => this._showLogs(item),
        },
        ]

    private _view(model: BannedPerson) {
        this.bannedPersonService.viewDialog(model, false)
            .pipe(take(1))
            .subscribe();
    }
    private _buildInquiryForms() {
        this.form = this.fb.group(new BannedPersonSearch().buildForm());
    }
    
    private _listenToRequestTypeChange() {

        this.requestTypeControl.valueChanges
            .pipe(
                tap(_ => this._reset()),
                takeUntil(this.destroy$)

            ).subscribe();
    }
    private _reset(): void {
        this.form.reset();
        this.bannedPersonList$.next([]);
        this.bannedPersonTerrorismList$.next([]);
    }

    private _listenToSearch() {
        this.search$.pipe(
            filter(_ => this.requestTypeControl.valid),
            map(model => [model, this.requestTypeControl.value]),
            tap(([model, requestType]) => {
                requestType === BannedSearch.COMMISSION_DATABASE ?
                    this.racaSearch$.next(model) :
                    this.moiSearch$.next(model)
            }),
            takeUntil(this.destroy$)
        ).subscribe();

    }
    private _listenToRACASearch() {
        this.racaSearch$.pipe(
            switchMap((model) => this.bannedPersonService.getAllRacaByCriteria(model)),
            tap(list => {
                if (!list.length) {this.dialog.info(this.lang.map.no_result_for_your_search_criteria)}
              }),
            tap(list => this.bannedPersonList$.next(list)),
            takeUntil(this.destroy$)
        ).subscribe();

    }
    private _listenToMOISearch() {
        this.moiSearch$.pipe(
            switchMap((model) => this.bannedPersonService.getALL_MOIByCriteria(model)),
            tap(list => {
                if (!list.length) {this.dialog.info(this.lang.map.no_result_for_your_search_criteria)}
              }),
            tap(list => this.bannedPersonTerrorismList$.next(list)),
            takeUntil(this.destroy$)
        ).subscribe();

    }


     _showLogs(model: BannedPerson) {
        this.bannedPersonService.showLogs(model.id)
            .pipe(
                take(1),
            )
            .subscribe();
    }
    private _handleSearchPermissions (){
        if(!this.employeeService.hasPermissionTo(PermissionsEnum.SEARCH_BANNED_PERSON_RACA)){
            this.requestTypeControl.setValue(BannedSearch.TERRORISM_MOI)
            this.requestTypeControl.disable()
        }
        if(!this.employeeService.hasPermissionTo(PermissionsEnum.SEARCH_BANNED_PERSON_MOI)){
            this.requestTypeControl.setValue(BannedSearch.COMMISSION_DATABASE)
            this.requestTypeControl.disable()
        }
    }
}
