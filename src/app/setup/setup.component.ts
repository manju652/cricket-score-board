import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatchService } from '../services/match.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent {
   teamA = '';
  teamB = '';
  overs = 5;
  ruleType: 'gully' | 'international' = 'gully';
  

  constructor(private matchService: MatchService, private router: Router) {}

  startMatch() {
    console.log('karthik')
    const match = {
  teamA: this.teamA,
  teamB: this.teamB,
  totalOvers: this.overs,

  score: 0,
  wickets: 0,
  extras: 0,

  currentOver: 0,
  balls: 0, // 0–5

  innings: 1, 
  maxWickets: 10,

  isMatchEnded: false, 
  ruleType: this.ruleType,

  striker: { name: 'Batsman 1', runs: 0, balls: 0 },
  nonStriker: { name: 'Batsman 2', runs: 0, balls: 0 },
  teamAPlayers: [],
  teamBPlayers: []
};

    this.matchService.saveCurrentMatch(match);
    this.router.navigate(['/home']);
  }
}
