import { NO_SCROLL_CLASS } from './constants';

export const debounce = (fn, delay = 400) => {
    let timer;
    function debounced(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    }
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
};

export const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
};

export const getFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

export const lockScroll = () => {
    document.body.classList.add(NO_SCROLL_CLASS);
};

export const unlockScroll = () => {
    document.body.classList.remove(NO_SCROLL_CLASS);
};

export const addMask = (addDesktopVersion = true) => {
    const mask = document.querySelector('.mask');
    mask.classList.add('mask--active');
    if (addDesktopVersion) {
        mask.classList.add('mask--active-desktop-hidden');
    }
    mask.hidden = false;
};

export const removeMask = (removeDesktopVersion = true) => {
    const mask = document.querySelector('.mask');
    mask.classList.remove('mask--active');
    if (removeDesktopVersion) {
        mask.classList.remove('mask--active-desktop-hidden');
    }
    mask.hidden = true;
};
