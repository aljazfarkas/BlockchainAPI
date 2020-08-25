import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserLoginService {
  //naslov storitve
  public static userHost = 'http://localhost:3000/';

  constructor(private http: HttpClient) { }
  login(user: User): Observable<User> {
    const headers = new HttpHeaders();
    //pomembno je, da nastavimo header na withCredentials:true
    //slednje pomeni, da se ob zahtevi pošiljajo tudi piškotki, kar pomeni, da bomo z strežnikom ob prijavi vzpostavili sejo (sejni piškotek)
    //to nam omogoča, da pri naslednjih zahtevan na strežnik, ostanemo avtenticirani

    //.pipe(map(x=y); kombinacija omogoča, da ob uspešni izvedbi zahteve objekt, ki ga storitev vrača spermenimo
    //pri tem lahko seveda naredimo tudi "stranske" korake, kot je shranjevanje objekta v localstorage
    //.pipe(map()) še vedno vrača observable z enakim tipom
    return this.http.post<User>(UserLoginService.userHost + 'users/login', user, { headers, withCredentials: true }).pipe(
      map(user => {
        if (user) {
          //uporabnika si zapišemo v localStorage, da bomo tudi v naši Angular aplikaciji vedeli, da je prijava uspela
          //vedno, ko bomo želeli preveriti, če je uporabnik prijavljen, lahko pogledamo v sejo
          //alternativa bi bila preveranje sejnega piškotka, pri čemer pa ne bi vedeli, če je bila prijava uspešna
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        return user;
      }));
  }

  logout() {
    //odstranimo uporabnika iz local storage, pravilno bi bilo tudi na strežnik poslati zahtevo po odjavi, da se na strežniški strani uniči seja
    //this.http.get(UserLoginService.userHost+'users/logout');
    localStorage.removeItem('currentUser');
  }
}
