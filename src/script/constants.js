export const breakpoints = {
    small: 430,
    medium: 1024,
    large: 1440,
};

export const RESIZE_DEBOUNCE_DELAY = 400;
export const NO_SCROLL_CLASS = 'no-scroll';
export const SPECIAL_DEALS_LABEL = 'SPECIAL_DEALS';
export const USER_WON_DEALS = 'USER_WON_DEALS';
export const MODAL_TYPE_UNLOCKED_DEALS = 'UNLOCKED_DEALS';
export const MODAL_TYPE_SPIN_AND_WIN = 'SPIN_AND_WIN';
export const WHELL_SIDE = 227;
export const DECAY = 0.985;
export const COMPLETE_ANGLE = 360;
export const STOP_THRESHOLD = 0.05;

export const SEGMENTS = [
    { min: 270, max: 360 }, // idx 0 → cell 1, top-left (red)
    { min: 0, max: 90 }, // idx 1 → cell 2, top-right (purple)
    { min: 180, max: 270 }, // idx 2 → cell 3, bottom-left (aqua)
    { min: 90, max: 180 }, // idx 3 → cell 4, bottom-right (mustard)
];
export const BORDER_EPSILON = 0.5;

export const API_ENDPOINT =
    'https://gist.githubusercontent.com/ameer-wajid-ali/1f29ebee4295cede36f8d74b45e576df/raw/122966c9a123861249f173911d8d93a76dc06d7a/';
