import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {listAnimation} from '../../../animations/list.animation';
import {LangService} from '../../../services/lang.service';
import {Subscription} from 'rxjs';
import {EmployeeService} from '../../../services/employee.service';
import {MenuItem} from '../../../models/menu-item';
import {Router} from '@angular/router';


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

  constructor(private langService: LangService,
              private  cd: ChangeDetectorRef,
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
}
