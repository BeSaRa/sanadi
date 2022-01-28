import {Component, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {NavigationService} from '@app/services/navigation.service';

@Component({
  selector: 'inquiry-container',
  templateUrl: './inquiry-container.component.html',
  styleUrls: ['./inquiry-container.component.scss']
})
export class InquiryContainerComponent implements OnInit {

  constructor(public lang: LangService, private navigationService: NavigationService) {
  }

  ngOnInit(): void {
  }

  navigateBack() {
    this.navigationService.goToBack();
  }
}
