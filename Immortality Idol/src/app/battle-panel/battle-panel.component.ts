import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BattleOptionsPanelComponent } from '../battle-options-panel/battle-options-panel.component';
import { BattleService } from '../game-state/battle.service';
import { CharacterService } from '../game-state/character.service';
import { GameStateService } from '../game-state/game-state.service';
import { MainLoopService } from '../game-state/main-loop.service';

@Component({
  selector: 'app-battle-panel',
  templateUrl: './battle-panel.component.html',
  styleUrls: ['./battle-panel.component.less', '../app.component.less'],
})
export class BattlePanelComponent {
  Math: Math;
  imageFile: string = '';

  constructor(
    public battleService: BattleService,
    public characterService: CharacterService,
    public gameStateService: GameStateService,
    public mainLoopService: MainLoopService,
    public dialog: MatDialog
  ) {
    this.Math = Math;
    // only update the picture for the enemy every long tick for performance
    this.mainLoopService.longTickSubject.subscribe(() => {
      this.imageFile = 'assets/images/monsters/' + this.battleService.currentEnemy?.enemy?.baseName + '.png';
    });
  }

  autoTroubleChange(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    this.battleService.autoTroubleEnabled = event.target.checked;
  }

  godSlayersEnableChange(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    this.battleService.godSlayersEnabled = event.target.checked;
  }

  battleOptions() {
    this.dialog.open(BattleOptionsPanelComponent, {
      width: '700px',
      data: { someField: 'foo' },
      autoFocus: false,
    });
  }
}