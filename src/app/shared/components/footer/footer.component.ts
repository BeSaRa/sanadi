import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(public langService: LangService) {
  }

  ngOnInit(): void {
  }

}
