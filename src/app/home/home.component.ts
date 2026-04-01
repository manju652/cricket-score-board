import { Component, OnInit  } from '@angular/core';
import { MatchService } from '../services/match.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  match: any;
  history: any[] = [];

  viewMode: 'live' | 'scorecard' = 'live';

  currentOverBalls: string[] = [];
  oversHistory: string[][] = [];

  constructor(private matchService: MatchService, private router: Router) {}

  ngOnInit() {
    this.match = this.matchService.getCurrentMatch();

    if (!this.match) {
      this.router.navigate(['/setup']);
      return;
    }

    // ✅ initialize safely
    this.match.teamAPlayers = this.match.teamAPlayers || [];
    this.match.teamBPlayers = this.match.teamBPlayers || [];
    this.match.innings = this.match.innings || 1;
    this.match.isMatchEnded = this.match.isMatchEnded || false;
  }

  // =========================
  // 🔁 SAVE STATE (FIXED DEEP COPY)
  // =========================
  saveState() {
    this.history.push(JSON.parse(JSON.stringify({
      match: this.match,
      currentOverBalls: this.currentOverBalls,
      oversHistory: this.oversHistory
    })));
  }

  undo() {
    if (this.history.length > 0) {
      const prev = this.history.pop();

      this.match = prev.match;
      this.currentOverBalls = prev.currentOverBalls;
      this.oversHistory = prev.oversHistory;

      this.save();
    }
  }

  save() {
    this.matchService.saveCurrentMatch(this.match);
  }

  // =========================
  // 🏏 PLAYER TRACK
  // =========================
  addPlayer(player: any) {
    const list = this.match.innings === 1
      ? this.match.teamAPlayers
      : this.match.teamBPlayers;

    if (!list.find((p: any) => p.name === player.name)) {
      list.push(player);
    }
  }

  addPlayerIfNotExists(player: any) {
  let list = this.match.innings === 1 
    ? this.match.teamAPlayers 
    : this.match.teamBPlayers;

  if (!list.find((p: any) => p.name === player.name)) {
    list.push(player);
  }
}

  // =========================
  // 🏏 RUNS
  // =========================
  addRuns(runs: number) {
    if (this.match.isMatchEnded) return;

    this.saveState();

    this.match.score += runs;
    this.match.striker.runs += runs;
    this.match.striker.balls++;

    if (runs === 4) this.match.striker.fours++;
    if (runs === 6) this.match.striker.sixes++;

    this.addPlayer(this.match.striker);
    this.addPlayerIfNotExists(this.match.striker);

    this.currentOverBalls.push(runs.toString());

    this.updateBall();

    if (runs % 2 !== 0) this.swapStrike();

    this.checkOverComplete();
    this.checkMatchEnd();

    this.save();
  }

  // =========================
  // 🧨 WICKET (FIXED)
  // =========================
  wicket() {
    if (this.match.isMatchEnded) return;

    this.saveState();

    this.match.wickets++;
    this.match.striker.balls++;

    this.currentOverBalls.push('W');

    this.updateBall();

    // ✅ new batsman reset properly
    const name = prompt('Enter new batsman name') || 'Player';

    this.match.striker = {
      name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0
    };

    this.checkOverComplete();
    this.checkMatchEnd();

    this.save();
  }

  // =========================
  // 🟡 WIDE (FIXED RULE)
  // =========================
  addWide() {
    if (this.match.isMatchEnded) return;

    this.saveState();

    if (this.match.ruleType === 'international') {
      this.match.score += 1;
      this.match.extras += 1;
      this.currentOverBalls.push('Wd');
    } else {
      // ✅ GULLY → NO RUN
      this.currentOverBalls.push('Wd*');
    }

    this.save();
  }

  // =========================
  // 🔄 BALL SYSTEM (FIXED)
  // =========================
  updateBall() {
    if (this.match.balls < 5) {
      this.match.balls++;
    } else {
      this.match.currentOver++;
      this.match.balls = 0;

      this.swapStrike();
    }
  }

  // =========================
  // 🔁 STRIKE
  // =========================
  swapStrike() {
    const temp = this.match.striker;
    this.match.striker = this.match.nonStriker;
    this.match.nonStriker = temp;
  }

  // =========================
  // 📊 OVER COMPLETE
  // =========================
  checkOverComplete() {
    if (this.match.balls === 0 && this.currentOverBalls.length > 0) {
      this.oversHistory.push([...this.currentOverBalls]);
      this.currentOverBalls = [];
    }
  }

  // =========================
  // 🧠 MATCH LOGIC (FIXED)
  // =========================
  checkMatchEnd() {

    // overs finished
    if (this.match.currentOver >= this.match.totalOvers) {
      this.endInnings();
    }

    // chase finished
    if (
      this.match.innings === 2 &&
      this.match.score >= this.match.target
    ) {
      this.match.isMatchEnded = true;
      this.decideWinner();
    }
  }

  endInnings() {

    if (this.match.innings === 1) {

      // ✅ set target
      this.match.target = this.match.score + 1;

      this.match.innings = 2;

      // reset innings
      this.match.score = 0;
      this.match.wickets = 0;
      this.match.currentOver = 0;
      this.match.balls = 0;
      this.match.extras = 0;

      this.currentOverBalls = [];
      this.oversHistory = [];

      alert('2nd Innings Started');

    } else {
      this.match.isMatchEnded = true;
      this.decideWinner();
    }

    this.save();
  }

  decideWinner() {
    this.match.result =
      this.match.score >= this.match.target
        ? `${this.match.teamB} won`
        : `${this.match.teamA} won`;
  }

  // =========================
  // 📊 STATS
  // =========================
  get oversDisplay() {
    return `${this.match.currentOver}.${this.match.balls}`;
  }

  get currentRunRate() {
    const balls = this.match.currentOver * 6 + this.match.balls;
    return balls ? (this.match.score / balls) * 6 : 0;
  }

  get requiredRunRate() {
    if (this.match.innings !== 2) return 0;

    const runsLeft = this.match.target - this.match.score;

    const ballsLeft =
      this.match.totalOvers * 6 -
      (this.match.currentOver * 6 + this.match.balls);

    return ballsLeft > 0 ? (runsLeft / ballsLeft) * 6 : 0;
  }

  // =========================
  // 🔁 NEW MATCH
  // =========================
  newMatch() {
    this.matchService.clearMatch();
    this.router.navigate(['/setup']);
  }

}
