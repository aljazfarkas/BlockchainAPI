import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserRegisterService {
	public static userHost = 'http://localhost:3000/';

  constructor(private http: HttpClient) { }

  register(user:User): Observable<User> {
    const headers = new HttpHeaders();
    return this.http.post<User>(UserRegisterService.userHost+'users/', user,{ headers, withCredentials: true });

  }
}
