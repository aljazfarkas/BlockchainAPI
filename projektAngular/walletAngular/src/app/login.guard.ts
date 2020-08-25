import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

   constructor(private router: Router) { }

   canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    
      if (localStorage.getItem('currentUser')) {
           //prijavljen
            return true;
        }
 
        // če nismo prijavljeni, navigiramo na prijavno strna, zraven pa pošljemo še url, na katerega je uporabnik želel
        //tako bomo lahko po uspešni prijavi uporabnika preusmerili nazaj na naslov, ki ga je zahteval
        this.router.navigate(['/user-login'], { queryParams: { returnUrl: state.url }});
        return false;
  }
}
