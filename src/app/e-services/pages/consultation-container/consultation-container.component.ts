import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {NavigationService} from '../../../services/navigation.service';

@Component({
  selector: 'consultation-container',
  templateUrl: './consultation-container.component.html',
  styleUrls: ['./consultation-container.component.scss']
})
export class ConsultationContainerComponent implements OnInit {

  constructor(public lang: LangService, private navigationService: NavigationService) {
  }

  ngOnInit(): void {
  }

  navigateBack() {
    this.navigationService.goToBack();
  }

}
