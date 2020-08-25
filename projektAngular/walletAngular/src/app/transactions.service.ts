import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  public static userHost = 'http://localhost:3000/';

  constructor(private http: HttpClient) { }

  createTransaction(address: string, amount: Number, username: string): Observable<any> {
    const headers = new HttpHeaders();
    return this.http.post<any>(TransactionsService.userHost + 'users/createTransaction', { "address": address, "amount": amount, "username": username }, { headers, withCredentials: true });
  }
  getMyTransactions(username: string):Observable<any>{
    const headers = new HttpHeaders();
    return this.http.get<any>(TransactionsService.userHost + 'users/myTransactions/' + username, { headers, withCredentials: true });
  }
}
