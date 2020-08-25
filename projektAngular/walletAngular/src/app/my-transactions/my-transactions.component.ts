import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-my-transactions',
  templateUrl: './my-transactions.component.html',
  styleUrls: ['./my-transactions.component.css']
})
export class MyTransactionsComponent implements OnInit {
  transactions = [];

  constructor(private Router: Router, private TransactionsService: TransactionsService) { }

  ngOnInit(): void {
    this.TransactionsService.getMyTransactions(JSON.parse(localStorage.getItem("currentUser")).username).subscribe(json => {
      this.transactions = json;
      console.log(this.transactions);
    });
  }

}
