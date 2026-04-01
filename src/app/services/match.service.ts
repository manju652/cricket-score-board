import { Injectable } from '@angular/core';
import { Match } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
   saveCurrentMatch(match: Match) {
    localStorage.setItem('currentMatch', JSON.stringify(match));
  }

  getCurrentMatch(): Match {
    return JSON.parse(localStorage.getItem('currentMatch') || 'null');
  }

 clearMatch() {
  localStorage.removeItem('currentMatch');
}
  constructor() { }
}
