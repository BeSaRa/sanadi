import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {CountryService} from "@services/country.service";
import {Country} from "@app/models/country";

@Injectable({
  providedIn: 'root'
})
export class CountryOldResolver implements Resolve<Country[]> {
  constructor(private countryService: CountryService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Country[]> {
    return this.countryService.loadAsLookups()
  }
}
