import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReadModeService {
  private readModeRequests: Map<number, boolean> = new Map<number, boolean>();

  constructor() {
  }

  setReadOnly(id: number): void {
    this.readModeRequests.set(id, true);
  }

  isReadOnly(id: number): boolean {
    return !!(this.readModeRequests.has(id) && this.readModeRequests.get(id));
  }

  deleteReadOnly(id: number): boolean {
    return this.readModeRequests.has(id) && this.readModeRequests.delete(id);
  }

}
