const SETTINGS_KEY = 'glicosim_settings';

export interface GlucoseSettings {
  minLimit: number;
  idealMax: number;
  maxLimit: number;
}

const DEFAULT_SETTINGS: GlucoseSettings = {
  minLimit: 55,
  idealMax: 100,
  maxLimit: 500
};

export const settingsService = {
  getSettings: (): GlucoseSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: GlucoseSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  resetSettings: (): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }
};
