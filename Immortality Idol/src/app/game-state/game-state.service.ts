import { Injectable } from '@angular/core';
import { ActivityService, ActivityProperties } from './activity.service';
import { BattleService, BattleProperties } from './battle.service';
import { LogProperties, LogService, LogTopic } from './log.service';
import { MainLoopProperties, MainLoopService } from './main-loop.service';
import { ReincarnationService } from './reincarnation.service';
import { AchievementProperties, AchievementService } from './achievement.service';
import { CharacterProperties, AttributeType } from './character';
import { CharacterService } from './character.service';
import { FollowersService, FollowersProperties } from './followers.service';
import { HomeService, HomeProperties } from './home.service';
import { InventoryService, InventoryProperties } from './inventory.service';
import { ItemRepoService } from './item-repo.service';
import { ImpossibleTaskProperties, ImpossibleTaskService } from './impossibleTask.service';
import { AutoBuyerProperties, AutoBuyerService } from './autoBuyer.service';
import { HellProperties, HellService } from './hell.service';
import { OfflineModalComponent } from '../offline-modal/offline-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { KtdGridLayout } from '@katoid/angular-grid-layout';

const LOCAL_STORAGE_GAME_STATE_KEY = 'immortalityIdleGameState';

interface GameState {
  achievements: AchievementProperties;
  character: CharacterProperties;
  inventory: InventoryProperties;
  home: HomeProperties;
  activities: ActivityProperties;
  battles: BattleProperties;
  followers: FollowersProperties;
  logs: LogProperties;
  autoBuy: AutoBuyerProperties;
  mainLoop: MainLoopProperties;
  impossibleTasks: ImpossibleTaskProperties;
  hell: HellProperties;
  darkMode: boolean;
  gameStartTimestamp: number;
  saveInterval: number;
  easyModeEver: boolean;
  lockPanels: boolean;
  layout: KtdGridLayout;
}

declare global {
  interface Window {
    GameStateService: GameStateService;
  }
}

export enum PanelIndex {
  Attributes = 0,
  Health = 1,
  Log = 2,
  Activity = 3,
  Home = 4,
  Time = 5,
  Battle = 6,
  Inventory = 7,
  Equipment = 8,
  Followers = 9,
  Portal = 10,
  Pets = 11,
}

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  lastSaved = new Date().getTime();
  isDarkMode = false;
  isImport = false;
  isExperimental = window.location.href.includes('experimental');
  gameStartTimestamp = new Date().getTime();
  easyModeEver = false;
  saveInterval = 300; //In seconds
  saveSlot = '';
  lockPanels = true;
  dragging = false;
  layout: KtdGridLayout;

  constructor(
    private characterService: CharacterService,
    private homeService: HomeService,
    private inventoryService: InventoryService,
    private logService: LogService,
    private reincarnationService: ReincarnationService,
    private activityService: ActivityService,
    private itemRepoService: ItemRepoService,
    private battleService: BattleService,
    private followersService: FollowersService,
    private autoBuyerService: AutoBuyerService,
    private mainLoopService: MainLoopService,
    private dialog: MatDialog,
    private achievementService: AchievementService,
    private impossibleTaskService: ImpossibleTaskService,
    private hellService: HellService
  ) {
    window.GameStateService = this;
    mainLoopService.longTickSubject.subscribe(() => {
      const currentTime = new Date().getTime();
      if (currentTime - this.lastSaved >= this.saveInterval * 1000) {
        this.savetoLocalStorage();
      }
    });
    this.layout = [];
    this.resetPanels();
  }

  resetPanels() {
    if (window.matchMedia('(max-width: 700px)').matches) {
      // narrow viewport
      this.layout = [
        {
          id: 'timePanel',
          x: 0,
          y: 16,
          w: 100,
          h: 6,
        },
        {
          id: 'attributesPanel',
          x: 0,
          y: 3,
          w: 100,
          h: 5,
        },
        {
          id: 'followersPanel',
          x: 0,
          y: 47,
          w: 100,
          h: 6,
        },
        {
          id: 'healthPanel',
          x: 0,
          y: 0,
          w: 100,
          h: 3,
        },
        {
          id: 'activityPanel',
          x: 0,
          y: 8,
          w: 100,
          h: 8,
        },
        {
          id: 'battlePanel',
          x: 0,
          y: 8,
          w: 100,
          h: 4,
        },
        {
          id: 'equipmentPanel',
          x: 0,
          y: 26,
          w: 100,
          h: 9,
        },
        {
          id: 'homePanel',
          x: 0,
          y: 22,
          w: 100,
          h: 4,
        },
        {
          id: 'inventoryPanel',
          x: 0,
          y: 35,
          w: 100,
          h: 12,
        },
        {
          id: 'logPanel',
          x: 0,
          y: 66,
          w: 100,
          h: 7,
        },
        {
          id: 'portalPanel',
          x: 0,
          y: 59,
          w: 100,
          h: 7,
        },
        {
          id: 'petsPanel',
          x: 0,
          y: 53,
          w: 100,
          h: 6,
        },
      ];
    } else {
      this.layout = [
        {
          id: 'timePanel',
          x: 36,
          y: 0,
          w: 16,
          h: 6,
        },
        {
          id: 'attributesPanel',
          x: 0,
          y: 3,
          w: 15,
          h: 5,
        },
        {
          id: 'followersPanel',
          x: 52,
          y: 0,
          w: 13,
          h: 6,
        },
        {
          id: 'healthPanel',
          x: 0,
          y: 0,
          w: 15,
          h: 3,
        },
        {
          id: 'activityPanel',
          x: 15,
          y: 0,
          w: 13,
          h: 8,
        },
        {
          id: 'battlePanel',
          x: 0,
          y: 8,
          w: 28,
          h: 4,
        },
        {
          id: 'equipmentPanel',
          x: 36,
          y: 10,
          w: 16,
          h: 9,
        },
        {
          id: 'homePanel',
          x: 36,
          y: 6,
          w: 16,
          h: 4,
        },
        {
          id: 'inventoryPanel',
          x: 28,
          y: 0,
          w: 8,
          h: 12,
        },
        {
          id: 'logPanel',
          x: 0,
          y: 12,
          w: 36,
          h: 7,
        },
        {
          id: 'portalPanel',
          x: 52,
          y: 12,
          w: 13,
          h: 7,
        },
        {
          id: 'petsPanel',
          x: 52,
          y: 6,
          w: 13,
          h: 6,
        },
      ];
    }
  }

  changeAutoSaveInterval(interval: number): void {
    if (!interval || interval < 1) {
      interval = 1;
    } else if (interval > 900) {
      interval = 900;
    }
    this.saveInterval = interval;
    this.savetoLocalStorage();
  }

  /**
   *
   * @param isImport Leave undefined to load flag, boolean to change save to that boolean.
   */
  updateImportFlagKey(isImport?: boolean) {
    // A new key to avoid saving backups over mains, and mains over backups.
    if (isImport !== undefined) {
      this.isImport = isImport;
      const data = JSON.stringify(this.isImport);
      window.localStorage.setItem(LOCAL_STORAGE_GAME_STATE_KEY + this.getDeploymentFlavor() + 'isImport', data);
    } else {
      const data = window.localStorage.getItem(LOCAL_STORAGE_GAME_STATE_KEY + this.getDeploymentFlavor() + 'isImport');
      if (data) {
        this.isImport = JSON.parse(data);
      }
    }
  }

  savetoLocalStorage(): void {
    const saveCopy = window.localStorage.getItem(
      LOCAL_STORAGE_GAME_STATE_KEY + this.getDeploymentFlavor() + this.saveSlot
    );
    if (saveCopy) {
      window.localStorage.setItem(
        'BACKUP' + LOCAL_STORAGE_GAME_STATE_KEY + this.getDeploymentFlavor() + this.saveSlot,
        saveCopy
      );
    }
    window.localStorage.setItem(
      LOCAL_STORAGE_GAME_STATE_KEY + this.getDeploymentFlavor() + this.saveSlot,
      this.getGameExport()
    );
    this.lastSaved = new Date().getTime();
  }

  loadFromLocalStorage(backup = false): boolean {
    this.getSaveFile();
    const backupStr = backup ? 'BACKUP' : '';
    const gameStateSerialized = window.localStorage.getItem(
      backupStr + LOCAL_STORAGE_GAME_STATE_KEY + this.getDeploymentFlavor() + this.saveSlot
    );
    if (!gameStateSerialized) {
      return false;
    }
    this.importGame(gameStateSerialized);
    if (this.isImport) {
      this.characterService.toast('Load Successful');
      this.updateImportFlagKey(false);
    } else {
      this.dialog.open(OfflineModalComponent, {
        data: { earnedTicks: this.mainLoopService.earnedTicks },
        autoFocus: false,
      });
    }
    return true;
  }

  importLayout(value: string) {
    const layoutData = JSON.parse(value) as GameState;
    if (!layoutData || !layoutData.layout) {
      return;
    }
    this.layout = layoutData.layout;
  }

  importGame(value: string) {
    let gameStateSerialized: string;
    if (value.substring(0, 3) === 'iig') {
      // it's a new save file
      gameStateSerialized = decodeURIComponent(atob(value.substring(3)));
    } else {
      // it's a legacy save file
      gameStateSerialized = value;
    }
    const gameState = JSON.parse(gameStateSerialized) as GameState;
    this.impossibleTaskService.setProperties(gameState.impossibleTasks);
    this.hellService.setProperties(gameState.hell || {});
    this.characterService.characterState.setProperties(gameState.character);
    this.homeService.setProperties(gameState.home);
    this.inventoryService.setProperties(gameState.inventory);
    // restore functions to itemStacks, because JSON stringification throws them away
    for (const itemStack of this.inventoryService.itemStacks) {
      if (!itemStack.item) {
        continue;
      }
      const item = this.itemRepoService.getItemById(itemStack.item.id);
      if (item) {
        itemStack.item = item;
      }
    }
    this.activityService.setProperties(gameState.activities);
    this.battleService.setProperties(gameState.battles);
    this.followersService.setProperties(gameState.followers);
    this.logService.setProperties(gameState.logs);
    this.autoBuyerService.setProperties(gameState.autoBuy);
    this.mainLoopService.setProperties(gameState.mainLoop);
    this.achievementService.setProperties(gameState.achievements);
    this.isDarkMode = gameState.darkMode || false;
    this.gameStartTimestamp = gameState.gameStartTimestamp || new Date().getTime();
    this.easyModeEver = gameState.easyModeEver || false;
    this.saveInterval = gameState.saveInterval || 10;
    // Covers the case of folowerCap showing 0 when loading in
    this.followersService.updateFollowerCap();
    if (gameState.layout) {
      this.layout = gameState.layout;
    }
    this.lockPanels = gameState.lockPanels ?? true;
    this.updateImportFlagKey();
  }

  getLayoutExport(): string {
    const layoutData = {
      layout: this.layout,
      lockPanels: this.lockPanels,
    };
    return JSON.stringify(layoutData);
  }

  getGameExport(): string {
    const gameState: GameState = {
      achievements: this.achievementService.getProperties(),
      impossibleTasks: this.impossibleTaskService.getProperties(),
      hell: this.hellService.getProperties(),
      character: this.characterService.characterState.getProperties(),
      inventory: this.inventoryService.getProperties(),
      home: this.homeService.getProperties(),
      activities: this.activityService.getProperties(),
      battles: this.battleService.getProperties(),
      followers: this.followersService.getProperties(),
      logs: this.logService.getProperties(),
      autoBuy: this.autoBuyerService.getProperties(),
      mainLoop: this.mainLoopService.getProperties(),
      darkMode: this.isDarkMode,
      gameStartTimestamp: this.gameStartTimestamp,
      saveInterval: this.saveInterval || 300,
      easyModeEver: this.easyModeEver,
      lockPanels: this.lockPanels,
      layout: this.layout,
    };
    let gameStateString = JSON.stringify(gameState);
    gameStateString = 'iig' + btoa(encodeURIComponent(gameStateString));
    return gameStateString;
  }

  hardReset(): void {
    window.localStorage.removeItem(LOCAL_STORAGE_GAME_STATE_KEY + this.getDeploymentFlavor() + this.saveSlot);
    // eslint-disable-next-line no-self-assign
    window.location.href = window.location.href;
  }

  rebirth(): void {
    this.characterService.forceRebirth = true;
    this.mainLoopService.pause = false;
  }

  cheat(): void {
    this.logService.log(LogTopic.EVENT, 'You dirty cheater! You pressed the cheat button!');
    this.characterService.characterState.updateMoney(1e10);
    for (const key in this.itemRepoService.items) {
      const item = this.itemRepoService.items[key];
      if (item.type === 'manual' && item.use) {
        item.use();
      }
    }
    const keys = Object.keys(this.characterService.characterState.attributes) as AttributeType[];
    for (const key in keys) {
      const attribute = this.characterService.characterState.attributes[keys[key]];
      attribute.aptitude += 1e7;
      attribute.value += 1e7;
    }
    this.inventoryService.addItem(this.inventoryService.generateSpiritGem(25));
    this.homeService.upgradeToNextHome();
    while (this.homeService.upgrading) {
      this.homeService.upgradeTick();
    }
  }

  setSaveFile() {
    window.localStorage.setItem(
      'saveSlotFor' + LOCAL_STORAGE_GAME_STATE_KEY + this.getDeploymentFlavor(),
      this.saveSlot
    );
  }

  getSaveFile() {
    const saveString = window.localStorage.getItem(
      'saveSlotFor' + LOCAL_STORAGE_GAME_STATE_KEY + this.getDeploymentFlavor()
    );
    if (!saveString) {
      return;
    }
    this.saveSlot = saveString;
  }

  getDeploymentFlavor() {
    let href = window.location.href;
    if (href === 'http://localhost:4200/') {
      // development, use the standard save
      return '';
    } else if (href === 'https://immortalityidle.github.io/' || href === 'https://immortalityidle.github.io/old/') {
      // main game branch or old branch, use the standard save
      return '';
    } else if (href.includes('https://immortalityidle.github.io/')) {
      href = href.substring(0, href.length - 1); // trim the trailing slash
      return href.substring(href.lastIndexOf('/') + 1); //return the deployed branch so that the saves can be different for each branch
    }
    throw new Error('Hey, someone stole this game!'); // mess with whoever is hosting the game somewhere else and doesn't know enough javascript to fix this.
  }
}
