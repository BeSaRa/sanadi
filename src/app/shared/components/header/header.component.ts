import { Component, Input, OnInit } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { UrlService } from '@app/services/url.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EmployeeService } from '@app/services/employee.service';
import { Subject } from 'rxjs';

// noinspection AngularMissingOrInvalidDeclarationInModule
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
    this.langService.toggleLanguage().subscribe();
  }
}
