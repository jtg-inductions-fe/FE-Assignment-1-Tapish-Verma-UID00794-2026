import { breakpoints, RESIZE_DEBOUNCE_DELAY } from './constants';
import { debounce } from './utilities';

const hamburgerButtons = document.getElementsByClassName('header__hamburger');
const mask = document.querySelector('.mask');
const drawer = document.querySelector('.drawer');
const drawerClose = drawer.querySelector('.drawer__cross');
let lastFocused = null;

function openDrawer() {
    if (!drawer.classList.contains('nav-drawer--active')) {
        lastFocused = event.currentTarget;
        drawer.classList.add('nav-drawer--active');
        mask.classList.add('mask--active');
        drawer.inert = false;
        mask.hidden = false;
        drawerClose.focus();
    }
}

function closeDrawer() {
    if (drawer.classList.contains('nav-drawer--active')) {
        drawer.classList.remove('nav-drawer--active');
        mask.classList.remove('mask--active');
        drawer.inert = true;
        mask.hidden = true;
        (lastFocused || hamburgerButtons[0]).focus();
    }
}

function handleResize() {
    document.body.classList.remove('resize-animation-stopper');
    // In case of resizing from tablet to desktop
    if (window.innerWidth > breakpoints.medium) {
        closeDrawer();
    }
}

const debouncedResize = debounce(handleResize, RESIZE_DEBOUNCE_DELAY);

window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
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

    if (shouldClose) {
        closeDrawer();
    }
});

mask.addEventListener('click', closeDrawer);
