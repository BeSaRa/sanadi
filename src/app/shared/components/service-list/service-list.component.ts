import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {listAnimation} from '@app/animations/list.animation';
import {LangService} from '@app/services/lang.service';
import {Subscription} from 'rxjs';
import {EmployeeService} from '@app/services/employee.service';
import {MenuItem} from '@app/models/menu-item';
import {Router} from '@angular/router';
import { CustomEmployeePermission } from "@helpers/custom-employee-permission";


// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
  animations: [listAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceListComponent implements OnInit, OnDestroy {
  @Input()
  public list: MenuItem[] = [];
  public property: 'arName' | 'enName' = 'arName';
  private langSubscription?: Subscription;
  iconBackground: string = 'url(assets/images/top-pattern.png)';
  starsImage: string = 'url(assets/images/icons/stars.svg)';

  constructor(public langService: LangService,
              private cd: ChangeDetectorRef,
              private router: Router,
              public empService: EmployeeService) {
  }

  ngOnInit(): void {
    this.langSubscription = this.langService.onLanguageChange$.subscribe(() => {
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  navigateToPath(item: MenuItem): void {
    this.router.navigate([item.path]).then();
  }

  navigateToEServiceItemPath(item: MenuItem, navigationType: 'service'| 'search' | 'output'): void {
    let route = item.data!.servicePath;
    switch (navigationType) {
      case 'search':
        route = item.data!.searchPath;
        break;
      case 'output':
        route = item.data!.outputPath;
    }
    this.router.navigate([route]).then();
  }

  hasCustomPermissions(item: MenuItem): boolean {
    return CustomEmployeePermission.hasCustomPermission(item.langKey) ? CustomEmployeePermission.getCustomPermission(item.langKey)(this.empService, item) : true;
  }
}
