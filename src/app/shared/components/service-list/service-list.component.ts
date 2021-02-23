import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ServiceItem} from '../../models/service-item';
import {listAnimation} from '../../../animations/list.animation';
import {LangService} from '../../../services/lang.service';
import {Subscription} from 'rxjs';
import {EmployeeService} from '../../../services/employee.service';


@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
  animations: [listAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceListComponent implements OnInit, OnDestroy {
  @Input()
  public list: ServiceItem[] = [];
  public property: 'arName' | 'enName' = 'arName';
  private langSubscription?: Subscription;

  constructor(private langService: LangService, private  cd: ChangeDetectorRef,
              public empService: EmployeeService) {
  }

  ngOnInit(): void {
    this.langSubscription = this.langService.onLanguageChange$.subscribe((val) => {
      this.property = val.code + 'Name' as 'arName' | 'enName';
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }
}
