import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'inquiry-container',
  templateUrl: './inquiry-container.component.html',
  styleUrls: ['./inquiry-container.component.scss']
})
export class InquiryContainerComponent implements OnInit {

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
  }

}
