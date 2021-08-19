import {Component, OnInit} from '@angular/core';
import {LangService} from "@app/services/lang.service";

@Component({
  selector: 'internal-user-popup',
  templateUrl: './internal-user-popup.component.html',
  styleUrls: ['./internal-user-popup.component.scss']
})
export class InternalUserPopupComponent implements OnInit {

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
  }

}
