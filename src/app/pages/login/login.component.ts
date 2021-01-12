import {Component, OnInit} from '@angular/core';
import {LangService} from '../../services/lang.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  icon = 'mdi-eye';
  passwordFieldType = 'password';
  loginForm: FormGroup = {} as FormGroup;

  constructor(public lang: LangService, private router: Router, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

  }

  togglePasswordView(event: Event): void {
    event.preventDefault();
    this.icon = this.icon === 'mdi-eye' ? 'mdi-eye-off' : 'mdi-eye';
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  processLogin(): Promise<any> {
    return this.router.navigate(['home']);
  }
}
