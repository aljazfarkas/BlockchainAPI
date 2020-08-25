import { Component, OnInit } from '@angular/core';
import { User } from '../user.model';
import { UserRegisterService } from '../user-register.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {
  user: User = { username: '', password: '', _id: '', privateKey: '', publicKey: '' };

  constructor(private userRegisterService: UserRegisterService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    
  }
  register(): void {
    this.userRegisterService.register(this.user).subscribe(user => {
      this.router.navigate(['user-login'])
    })
  }
}
