import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { BalanceComponent } from './balance/balance.component';
import { CreateTransactionComponent } from './create-transaction/create-transaction.component'
import { LoginGuard } from './login.guard';
import { MyTransactionsComponent } from './my-transactions/my-transactions.component';

//dodamo možne poti, pri čemer je druga pot s parametrom :_id
//zadnja pot je zaščitena z prijavo
const routes: Routes = [
  { path: 'user-login', component: UserLoginComponent },
  { path: 'user-register', component: UserRegisterComponent },
  { path: 'balance', component: BalanceComponent, canActivate: [LoginGuard] },
  { path: 'create-transaction', component: CreateTransactionComponent, canActivate: [LoginGuard] },
  { path: 'my-transactions', component: MyTransactionsComponent, canActivate: [LoginGuard] },

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
