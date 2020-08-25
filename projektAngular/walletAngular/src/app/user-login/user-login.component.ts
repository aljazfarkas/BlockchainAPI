import { Component, OnInit } from '@angular/core';
import { User } from '../user.model';
import { UserLoginService } from '../user-login.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  //objekt, s katerim bomo povezovali podatke v htmlju
  user: User = { username: '', password: '', _id: '', privateKey: '', publicKey: '' };


  constructor(private userLoginService: UserLoginService, private route: ActivatedRoute, private router: Router) { }

  //ob prijavi vemo, da je v objektu user, trenutna vpisana vrednost iz vnosnih polj, ker smo jih povezali z ngmodel 
  //zato lahko pokličemo storitev prijave s tem objektom
  tryLogin(): void {
    this.userLoginService.login(this.user).subscribe(user => {
      //ob uspešni prijavi pogledamo stanje query parametrov
      //V koliokr so nastavljeni, uporabnika preusmerimo na naslov, iz katerega je zahtevana prijava
      //V nasprotnem primeru ga preusmerimo na privzeto stran (photos)
      this.route.queryParams.subscribe(
        params => {
          this.router.navigate([params['returnUrl'] || 'balance']);
        });
    });
  }
  ngOnInit() {

  }
}
