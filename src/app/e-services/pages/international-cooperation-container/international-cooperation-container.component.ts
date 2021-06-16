import { Component, OnInit } from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {NavigationService} from '../../../services/navigation.service';

@Component({
  selector: 'international-cooperation-container',
  templateUrl: './international-cooperation-container.component.html',
  styleUrls: ['./international-cooperation-container.component.scss']
})
export class InternationalCooperationContainerComponent implements OnInit {

  constructor(public lang: LangService, private navigationService: NavigationService) {
  }

  ngOnInit(): void {
  }

  navigateBack() {
    this.navigationService.goToBack();
  }

}
