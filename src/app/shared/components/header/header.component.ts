import {Component, Input, OnInit} from '@angular/core';
import {AppRootScrollService} from '../../../services/app-root-scroll.service';
import {LangService} from '../../../services/lang.service';
import {UrlService} from '../../../services/url.service';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {EmployeeService} from '../../../services/employee.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input()
  sidebar!: SidebarComponent;
  menuState: string = 'mdi-menu';

  constructor(private scrollService: AppRootScrollService,
              public langService: LangService,
              public employee: EmployeeService,
              public urlService: UrlService) {
  }

  ngOnInit(): void {
    this.scrollService.onScroll$.subscribe((scroll) => this.onScroll(scroll));
    this.sidebar.openStateChanged$.subscribe((isOpen) => {
      this.menuState = isOpen ? 'mdi-menu-open' : 'mdi-menu';
    });
  }

  /**
   * @description eventListener callback to listen to scroll event on the window.
   */
  onScroll(scroll: number): void {
    console.log('scrolling : ', scroll);
  }

  toggleSidebar() {
    this.sidebar.toggle();
  }

  toggleLang($event: MouseEvent) {
    $event.preventDefault();
    this.langService.toggleLanguage();
  }
}
