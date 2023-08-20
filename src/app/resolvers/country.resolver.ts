import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {Country} from "@models/country";
import {CountryService} from "@services/country.service";
import {inject} from "@angular/core";

export class CountryResolver {

  static resolve:  ResolveFn<Country[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Country[]> => {
    return inject(CountryService).loadAsLookups();
  }
}
