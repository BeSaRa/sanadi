import {Component, OnInit} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {LangService} from '@services/lang.service';
import {takeUntil} from 'rxjs/operators';
import {CustomMenuService} from '@services/custom-menu.service';
import {CommonUtils} from '@helpers/common-utils';
import {MenuItemService} from '@services/menu-item.service';
import {MenuItemParametersEnum} from '@app/enums/menu-item-parameters.enum';
import {MenuItem} from '@app/models/menu-item';

@Component({
  selector: 'dynamic-menu-details',
  templateUrl: './dynamic-menu-details.component.html',
  styleUrls: ['./dynamic-menu-details.component.scss']
})
export class DynamicMenuDetailsComponent implements OnInit {
  safeUrl!: SafeUrl;
  dynamicMenu!: MenuItem;
  private destroy$: Subject<void> = new Subject();

  constructor(private domSanitizer: DomSanitizer,
              private activeRoute: ActivatedRoute,
              public lang: LangService,
              private customMenuService: CustomMenuService,
              private menuService: MenuItemService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.prepareSafeUrl();
    this.listenToLangChange();
  }

  private prepareSafeUrl(): void {
    this.activeRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      // .pipe(tap(v => console.log(v)))
      .subscribe((params) => {
        this.generateUrl(params);
      });
  }

  private _finalizeUrl(customMenuId: number): string {
    let menuItem = this.menuService.menuItems.find(x => !!x.customMenu && x.customMenu.id === Number(customMenuId));
    if (!menuItem || !menuItem.customMenu!.menuURL) {
      return '';
    }
    let url: string = menuItem.customMenu!.menuURL;
    let variablesInUrl = this.customMenuService.findVariablesInUrl(url);

    variablesInUrl.forEach((urlVariable) => {
      let parsedVariable = menuItem!.customMenu?.urlParamsParsed?.find(x => x.name === urlVariable);
      if (!parsedVariable) {
        return;
      }
      let replacementValue = this.customMenuService.getUrlReplacementValue(parsedVariable.value as MenuItemParametersEnum);
      url = url.replace(urlVariable, replacementValue);
    });
    this.dynamicMenu = menuItem;
    return url;
  }

  private generateUrl(params: ParamMap): void {
    let parentId = params.get('parentId');
    let childId = params.get('childId');
    let url: string = '';
    if (CommonUtils.isValidValue(childId)) {
      url = this._finalizeUrl(Number(childId));
    } else if (CommonUtils.isValidValue(parentId)) {
      url = this._finalizeUrl(Number(parentId));
    }
    this.safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(encodeURI(url));
  }

  private listenToLangChange(): void {
    this.lang.onLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.generateUrl(this.activeRoute.snapshot.paramMap);
      });
  }

}
