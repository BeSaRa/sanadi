import {ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot} from "@angular/router";
import {CanComponentDeactivateContract} from "@contracts/can-component-deactivate-contract";
import {switchMap, take} from "rxjs/operators";
import {UserClickOn} from "@enums/user-click-on.enum";
import {Observable, of} from "rxjs";
import {inject} from "@angular/core";
import {DialogService} from "@services/dialog.service";
import {LangService} from "@services/lang.service";
import {CanNavigateOptions} from "@app/types/types";

export class CanDeactivateGuard {
  static canDeactivate: CanDeactivateFn<CanComponentDeactivateContract> = (
    component: CanComponentDeactivateContract,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot) => {
    const canDeactivate = this._canDeactivateComponent(component);
    if (canDeactivate === 'CONFIRM_UNSAVED_CHANGES') {
      return this._confirmToNavigate();
    } else {
      return canDeactivate === 'ALLOW';
    }
  };

  private static _canDeactivateComponent(component: CanComponentDeactivateContract): CanNavigateOptions {
    if (!component.canDeactivate) {
      return 'ALLOW';
    }
    return component.canDeactivate();
  }

  private static _confirmToNavigate(): Observable<boolean> {
    const dialogService = inject(DialogService);
    const langService = inject(LangService);

    return dialogService.confirm(langService.map.msg_unsaved_changes_confirm)
      .onAfterClose$.pipe(
        take(1),
        switchMap((click: UserClickOn) => {
          return of(click === UserClickOn.YES)
        })
      );
  }
}
