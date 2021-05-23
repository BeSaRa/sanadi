import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../services/lang.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {CustomValidators} from '../../validators/custom-validators';
import {AuthService} from '../../services/auth.service';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, mapTo, takeUntil, tap} from 'rxjs/operators';
import {ToastService} from '../../services/toast.service';
import {ECookieService} from '../../services/e-cookie.service';
import {CustomHttpErrorResponse} from '../../models/custom-http-error-response';
import {TabComponent} from '../../shared/components/tab/tab.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  icon = 'mdi-eye';
  passwordFieldType = 'password';
  loginFormInternal: FormGroup = {} as FormGroup;
  private destroy$: Subject<any> = new Subject<any>();
  private login$: Subject<any> = new Subject<any>();
  loginFromExternal: FormGroup = {} as FormGroup;
  isExternalLogin = false;

  background: string = 'url(assets/images/login-background.png)';

  constructor(public lang: LangService,
              private router: Router,
              private fb: FormBuilder,
              private eCookieService: ECookieService,
              private toastService: ToastService,
              private authService: AuthService) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loginFromExternal = this.fb.group({
      username: ['', CustomValidators.required],
      password: [''] // for now it is not required till we make full integration with NAS Services.
    });
    this.loginFormInternal = this.fb.group({
      userName: ['', CustomValidators.required],
      userPassword: ['', CustomValidators.required] // for now it is not required till we make full integration with NAS Services.
    });
    this.listenToLoginEvent();
  }

  togglePasswordView(event: Event): void {
    event.preventDefault();
    this.icon = this.icon === 'mdi-eye' ? 'mdi-eye-off' : 'mdi-eye';
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  processLogin(): void {
    this.login$.next();
  }

  private listenToLoginEvent(): void {
    this.login$.pipe(
      exhaustMap(() => {
        return this.authService
          .login(this.isExternalLogin ? {qId: this.loginFromExternal.get('username')?.value} : this.loginFormInternal.value, this.isExternalLogin)
          .pipe(
            mapTo(true),
            tap(() => {
              this.toastService.success(this.lang.map.msg_login_success);
            }, (error: CustomHttpErrorResponse) => {
              this.toastService.error(error.getError());
            }),
            catchError(() => {
              return of(false);
            })
          );
      }),
      takeUntil(this.destroy$),
    ).subscribe((navigate) => {
      return navigate ? this.router.navigate(['/home']) : null;
    });
  }

  tabChanged(tab: TabComponent) {
    this.isExternalLogin = tab.title !== this.lang.map.authority_employee;
  }
}
