import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BalanceComponent } from './balance/balance.component';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  //naslov storitve
  public static userHost = 'http://localhost:3000/';

  constructor(private http: HttpClient) { }
  getBalance(username:string): Observable<any> {
    const headers = new HttpHeaders();
    return this.http.get<any>(BalanceService.userHost + "users/getBalance/" + username);
  }
}
