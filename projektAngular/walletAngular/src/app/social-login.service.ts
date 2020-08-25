import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SocialLoginService {
  url;

  constructor(private http: HttpClient) { }

  savesResponse(response) {
    this.url = 'http://localhost:3000/users/savesResponse';
    return this.http.post(this.url, response);
  }
}
