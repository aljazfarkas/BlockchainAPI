import { Component, OnInit } from '@angular/core';
import { BalanceService } from '../balance.service';
import { Router } from '@angular/router';

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {

  lineChartData: ChartDataSets[] = [
    { data: [], label: 'Stanje kovancev' },
  ];

  lineChartLabels: Label[] = ['10th', '9th', '8th', '7th', '6th', '5th', '4th', '3rd', '2nd', '1st'];

  lineChartOptions = {
    responsive: true,
  };

  lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(244,194,194,0.6)',
    },
  ];
  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';

  balance: number;
  publicKey: string;

  timeIntevalSeconds: number = 10;

  constructor(private BalanceService: BalanceService, private Router: Router) { }

  ngOnInit(): void {
    this.getBalanceAndUpdateGraph();
    setInterval(() => { this.getBalanceAndUpdateGraph() }, this.timeIntevalSeconds * 1000);
  }

  getBalanceAndUpdateGraph(): void {
    if (localStorage.getItem("balanceArray") == null) {
      localStorage.setItem("balanceArray", "[]");
    }
    this.BalanceService.getBalance(JSON.parse(localStorage.getItem("currentUser")).username).subscribe(json => {
      this.lineChartData[0].data = JSON.parse(localStorage.getItem("balanceArray"));
      this.balance = json.balance;
      if (this.lineChartData[0].data[this.lineChartData[0].data.length - 1] != this.balance) {
        if (this.lineChartData[0].data.length > 9) {
          while (this.lineChartData[0].data.length != 9) {
            this.lineChartData[0].data.shift();
          }
        }
        this.lineChartData[0].data.push(json.balance);
      }
      localStorage.setItem("balanceArray", JSON.stringify(this.lineChartData[0].data));
      this.publicKey = json.publicKey
    });
  }
}
