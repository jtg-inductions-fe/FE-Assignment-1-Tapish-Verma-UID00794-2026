import { breakpoints, RESIZE_DEBOUNCE_DELAY } from './constants';
import {
    debounce,
    lockScroll,
    unlockScroll,
    addMask,
    removeMask,
} from './utilities';
import { renderSpecialDealsModal } from './specialDeals';

const hamburgerButtons = document.getElementsByClassName('header__hamburger');
const mask = document.querySelector('.mask');
const drawer = document.querySelector('.drawer');
const drawerClose = drawer.querySelector('.drawer__cross');
let lastFocused = null;

function openDrawer(event) {
    if (!drawer.classList.contains('nav-drawer--active')) {
        lastFocused = event.currentTarget;
        event.currentTarget.setAttribute('aria-expanded', 'true');
        drawer.classList.add('nav-drawer--active');
        drawer.inert = false;
        drawerClose.focus();
        addMask();
        lockScroll();
    }
}

function closeDrawer() {
    if (drawer.classList.contains('nav-drawer--active')) {
        drawer.classList.remove('nav-drawer--active');
        drawer.inert = true;
        removeMask();
        unlockScroll();
        (lastFocused || hamburgerButtons[0]).focus();
        if (lastFocused) {
            lastFocused.setAttribute('aria-expanded', 'false');
        }
    }
}

let isResizing = false;

function handleResize() {
    document.body.classList.remove('resize-animation-stopper');
    isResizing = false;
    // In case of resizing from tablet to desktop
    if (window.innerWidth > breakpoints.medium) {
        closeDrawer();
    }
}

const debouncedResize = debounce(handleResize, RESIZE_DEBOUNCE_DELAY);

window.addEventListener('resize', () => {
    if (!isResizing) {
        document.body.classList.add('resize-animation-stopper');
        isResizing = true;
    }
    debouncedResize();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeDrawer();
    }
});

Array.from(hamburgerButtons).forEach((btn) =>
    btn.addEventListener('click', openDrawer),
);
drawer.addEventListener('click', (event) => {
    const shouldClose = event.target.closest(
        '.drawer__cross, .drawer__item, .drawer__actions button',
    );

    const isSpecialDeals = Array.from(event.target.classList).includes(
        'special-deals',
    );

    if (shouldClose) {
        closeDrawer();
        if (isSpecialDeals) {
            renderSpecialDealsModal({
                currentTarget: lastFocused,
            });
        }
    }
});

mask.addEventListener('click', closeDrawer);
