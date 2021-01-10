import {Component, OnInit} from '@angular/core';
import {LangService} from '../../services/lang.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  icon = 'mdi-eye';
  passwordFieldType = 'password';

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
  }

  togglePasswordView(event: Event): void {
    event.preventDefault();
    this.icon = this.icon === 'mdi-eye' ? 'mdi-eye-off' : 'mdi-eye';
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

}
