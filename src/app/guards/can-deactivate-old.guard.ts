import {Injectable} from '@angular/core';
import {CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {CanNavigateOptions} from '../types/types';
import {switchMap, take} from 'rxjs/operators';
import {UserClickOn} from '../enums/user-click-on.enum';
import {DialogService} from '../services/dialog.service';
import {LangService} from '../services/lang.service';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateOldGuard implements CanDeactivate<CanComponentDeactivate> {
  constructor(private dialogService: DialogService,
              private langService: LangService) {
  }

  canDeactivate(
    component: CanComponentDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!component.canDeactivate || component.canDeactivate() === 'ALLOW') {
      return true;
    } else {
      if (component.canDeactivate() === 'DISALLOW') {
        return false;
      } else {
        return this.dialogService.confirm(this.langService.map.msg_unsaved_changes_confirm)
          .onAfterClose$.pipe(
            take(1),
            switchMap((click: UserClickOn) => {
              return of(click === UserClickOn.YES)
            })
          );
      }
    }
  }
}

export interface CanComponentDeactivate {
  canDeactivate: () => CanNavigateOptions;
}
