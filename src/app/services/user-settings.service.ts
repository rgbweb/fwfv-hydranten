import { Injectable } from '@angular/core';

const LOCAL_STORAGE_KEY = 'fwfv_hydrants_user_settings';

interface StorageSettings {
  lastHighlightFilterString: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  private currentUserSettings: StorageSettings;

  get lastHighlightFilterString(): string {
    return this.currentUserSettings.lastHighlightFilterString;
  }
  set lastHighlightFilterString(value: string) {
    this.currentUserSettings.lastHighlightFilterString = value;
    this.saveUserSettings();
  }

  constructor() {
    this.currentUserSettings = this.loadUserSettings();
  }

  private loadUserSettings(): StorageSettings {
    let userSettings: StorageSettings = {
      lastHighlightFilterString: '',
    };

    try {
      const json = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (json) {
        userSettings = JSON.parse(json);
      }
    } catch (error) {
      // local storage is maybe not available
    }

    return userSettings;
  }

  private saveUserSettings() {
    try {
      const json = JSON.stringify(this.currentUserSettings);
      window.localStorage.setItem(LOCAL_STORAGE_KEY, json);
    } catch (error) {
      // local storage is maybe not available
    }
  }
}
