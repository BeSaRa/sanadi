import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {BehaviorSubject, Subject} from 'rxjs';

@Component({
  selector: 'app-custom-role',
  templateUrl: './custom-role.component.html',
  styleUrls: ['./custom-role.component.scss']
})
export class CustomRoleComponent implements OnInit {
  addNew$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(public langService: LangService) {
  }

  ngOnInit(): void {
  }
}
