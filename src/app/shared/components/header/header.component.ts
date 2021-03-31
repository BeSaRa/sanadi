import {Component, Input, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {UrlService} from '../../../services/url.service';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {EmployeeService} from '../../../services/employee.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input()
  sidebar!: SidebarComponent;
  destroy$: Subject<any> = new Subject<any>();

  constructor(public langService: LangService,
              public employee: EmployeeService,
              public urlService: UrlService) {
  }

  ngOnInit(): void {
  }

  toggleLang($event: MouseEvent) {
    $event.preventDefault();
    this.langService.toggleLanguage();
  }
}
