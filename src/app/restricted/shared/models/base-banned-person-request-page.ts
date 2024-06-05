import { Directive, inject } from "@angular/core";
import { ActionIconsEnum } from "@app/enums/action-icons-enum";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { BannedPerson } from "@app/models/banned-person";
import { IMenuItem } from "@app/modules/context-menu/interfaces/i-menu-item";
import { BannedPersonService } from "@app/services/banned-person.service";
import { DialogService } from "@app/services/dialog.service";
import { LangService } from "@app/services/lang.service";
import { ToastService } from "@app/services/toast.service";
import { BehaviorSubject, Observable } from "rxjs";
import { take } from "rxjs/operators";

@Directive()
export abstract class BaseBannedPersonRequestPage{

    title:keyof ILanguageKeys = 'menu_restricted';
    bannedPersonService = inject(BannedPersonService);
    dialogService = inject(DialogService);
    toast = inject(ToastService);
    lang = inject(LangService);

    reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    get defaultActions () :IMenuItem<BannedPerson>[]{
        return [
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
    }
    abstract get reloadFn() : ()=> Observable<BannedPerson[]>;
    abstract actions: IMenuItem<BannedPerson>[];

    protected _view(model: BannedPerson) {
        this.bannedPersonService.viewDialog(model, false)
            .pipe(take(1))
            .subscribe();
    }
    protected _showLogs(model: BannedPerson) {
        this.bannedPersonService.showLogs(model.id)
            .pipe(
                take(1),
            )
            .subscribe();
    }

}