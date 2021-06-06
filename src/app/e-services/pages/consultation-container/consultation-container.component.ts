import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'consultation-container',
  templateUrl: './consultation-container.component.html',
  styleUrls: ['./consultation-container.component.scss']
})
export class ConsultationContainerComponent implements OnInit {

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
  }

}
