import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-create-transaction',
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.css']
})
export class CreateTransactionComponent implements OnInit {
  public receiverAddress: string = "";
  public amount: Number;
  public htmlString: string = "";
  public classAttr: string = "";

  constructor(private Router: Router, private TransactionsService: TransactionsService) { }

  ngOnInit(): void {
  }

  createTransaction(): void {
    this.TransactionsService.createTransaction(this.receiverAddress, this.amount, JSON.parse(localStorage.getItem("currentUser")).username).subscribe(json => {
        if(json.body == "Error"){
          this.htmlString = "<p>Napaka pri ustvarjanju transakcije!</p>";
          this.classAttr = "error";
        } 
        else{
          this.htmlString = "<p>Transakcija uspešno poslana!</p>";
          this.classAttr = "success";
        }
    });
  }
}
