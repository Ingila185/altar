export enum GRIDSIZE {
  MAX_ROWS = 10,
  MAX_COLUMNS = 10,
}
export enum INTERVALS {
  COOLDOWN_TIME = 4000,
  UPDATE_INTERVAL = 1000,
}

export enum GRID_EXCEPTIONS {
  SINGLE_CHARACTER_EXCEPTION = 'Bias must be a single character',
  UPPERCASE_EXCEPTION = 'Bias must be a lowercase letter',
  NUMBER_EXCEPTION = 'Bias must be a letter',
  INVALID_BIAS_EXCEPTION = 'Invalid bias',
}
