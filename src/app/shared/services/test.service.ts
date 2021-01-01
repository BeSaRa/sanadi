import {Injectable} from '@angular/core';
import {ToastService} from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(public toast: ToastService) {
  }
}
