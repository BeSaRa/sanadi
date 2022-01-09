import {Component, OnInit} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ECookieService} from "@app/services/e-cookie.service";
import {ToastService} from "@app/services/toast.service";
import {AuthService} from "@app/services/auth.service";
import {of, Subject} from "rxjs";
import {CustomValidators} from "@app/validators/custom-validators";
import {catchError, exhaustMap, mapTo, takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'internal-login',
  templateUrl: './internal-login.component.html',
  styleUrls: ['../common/scss/login-style.scss']
})
export class InternalLoginComponent implements OnInit {
  icon = 'mdi-eye';
  passwordFieldType = 'password';
  loginFormInternal: FormGroup = {} as FormGroup;
  private destroy$: Subject<any> = new Subject<any>();
  private login$: Subject<any> = new Subject<any>();

  background: string = 'url(assets/images/login-background.png)';
  loginBackground: string = 'url(assets/images/background-2.jpg)';

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
    this.loginFormInternal = this.fb.group({
      userName: ['', CustomValidators.required],
      userPassword: ['', CustomValidators.required] // for now, it is not required till we make full integration with NAS Services.
    });
    this.listenToLoginEvent();
  }

  togglePasswordView(event: Event): void {
    event.preventDefault();
    this.icon = this.icon === 'mdi-eye' ? 'mdi-eye-off' : 'mdi-eye';
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  toggleLang($event: MouseEvent) {
    $event.preventDefault();
    this.lang.toggleLanguage().subscribe();
  }

  processLogin(): void {
    this.login$.next();
  }

  private listenToLoginEvent(): void {
    this.login$.pipe(
      exhaustMap(() => {
        return this.authService
          .login({
            userName: this.loginFormInternal.value.userName,
            userPassword: this.loginFormInternal.value.userPassword,
          }, false)
          .pipe(
            mapTo(true),
            tap(() => {
              this.toastService.success(this.lang.map.msg_login_success);
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

}
