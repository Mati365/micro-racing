import Color from 'color';

export const RED = '#ff0000';
export const GREEN = '#00ff10';
export const BLUE = '#0000ff';
export const WHITE = '#ffffff';

export const BLACK = '#000000';
export const DARK_GRAY = '#666666';
export const LIGHT_GRAY = '#F5F5F5';
export const DARKEST_GRAY = '#292929';

export const WHITE_DARKEN_5 = Color(WHITE).darken(0.5).hex();
export const GRAY_DARKEN_5 = Color(LIGHT_GRAY).darken(0.5).hex();

export const CRIMSON_RED = '#ff1a48';
export const CRIMSON_RED_DARKEN_5 = Color(CRIMSON_RED).darken(0.5).hex();
export const CRIMSON_RED_DARKEN_1 = Color(CRIMSON_RED).darken(0.1).hex();

export const SPRING_ORANGE = '#F7A758';

export const GRASS_GREEN = '#59C56D';
export const GRASS_GREEN_DARKEN_5 = Color(GRASS_GREEN).darken(0.5).hex();

export const SPRING_GREEN = '#94C751';
export const SPRING_GREEN_DARKEN_5 = Color(SPRING_GREEN).darken(0.5).hex();

export const DODGER_BLUE = '#1e90ff';
export const DODGER_BLUE_DARKEN_5 = Color(DODGER_BLUE).darken(0.5).hex();

export const DIM_GRAY = '#696969';

export const TEXT_COLORS = {
  CRIMSON_RED,

  DEFAULT: BLACK,

  PRIMARY: DODGER_BLUE,
  SECONDARY: DIM_GRAY,

  SUCCESS: SPRING_GREEN,
  DANGER: RED,

  SPRING_ORANGE,
  GRASS_GREEN,
  DARKEST_GRAY,
  DIM_GRAY,

  WHITE,
  BLACK,
};
