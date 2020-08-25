import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, FacebookLoginProvider, SocialUser } from 'angularx-social-login';
import { SocialLoginService } from './social-login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user: SocialUser;
  loggedInFb: boolean;
  response;

  title = 'Denarnica';

  constructor(private router: Router, private authService: AuthService, private socialLoginService: SocialLoginService) { }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedInFb = (user != null);
      console.log(this.user);
    });
  }
  isLoggedIn() {

    if (localStorage.getItem('currentUser') || this.loggedInFb) {
      // logged in so return true
      return true;
    }
    else
      return false;

  }
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('balanceArray');
    if (this.loggedInFb == true) {
      this.authService.signOut();
    }
    this.router.navigate(['user-login']);
  }
  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(user => {
      this.savesResponseFb(user);
    })
  }
  savesResponseFb(socialusers: SocialUser) {
    this.socialLoginService.savesResponse(socialusers).subscribe((res: any) => {
      console.log(res);
      this.user = res;
      this.response = res.userDetail;
      debugger;
      localStorage.setItem('currentUser', JSON.stringify(this.user));
      this.router.navigate([`/balance`]);
    })

  }
  signOut(): void {
  }

}
