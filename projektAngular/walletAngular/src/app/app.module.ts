import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './/app-routing.module';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { BalanceComponent } from './balance/balance.component';
import { CreateTransactionComponent } from './create-transaction/create-transaction.component';
import { MyTransactionsComponent } from './my-transactions/my-transactions.component';

import { ChartsModule } from 'ng2-charts';
import { SocialLoginModule, AuthServiceConfig, FacebookLoginProvider } from 'angularx-social-login';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const config = new AuthServiceConfig([
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('723343871760721')
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    UserLoginComponent,
    UserRegisterComponent,
    BalanceComponent,
    CreateTransactionComponent,
    MyTransactionsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ChartsModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  providers: [{
    provide: AuthServiceConfig,
    useFactory: provideConfig
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
