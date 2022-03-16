import {Component, HostListener, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {of, Subject} from "rxjs";
import {LangService} from "@app/services/lang.service";
import {Router} from "@angular/router";
import {ECookieService} from "@app/services/e-cookie.service";
import {ToastService} from "@app/services/toast.service";
import {AuthService} from "@app/services/auth.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {catchError, exhaustMap, mapTo, takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'external-login',
  templateUrl: './external-login.component.html',
  styleUrls: ['../common/scss/login-style.scss']
})
export class ExternalLoginComponent implements OnInit {
  icon = 'mdi-eye';
  passwordFieldType = 'password';
  private destroy$: Subject<any> = new Subject<any>();
  private login$: Subject<any> = new Subject<any>();
  loginFromExternal: FormGroup = {} as FormGroup;

  background: string = 'url(assets/images/login-background.png)';
  loginBackground: string = 'url(assets/images/background-3.jpg)';
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

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
      username: ['', [CustomValidators.required, CustomValidators.number]],
      password: [''] // for now, it is not required till we make full integration with NAS Services.
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
            qId: this.loginFromExternal.value.username
          }, true)
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

  get externalUserNameField(): AbstractControl {
    return this.loginFromExternal?.get('username') as AbstractControl;
  }

  @HostListener('window:keydown.f1')
  switchLoginPage() {
    this.router.navigate(['/login']).then()
    return false;
  }

}
