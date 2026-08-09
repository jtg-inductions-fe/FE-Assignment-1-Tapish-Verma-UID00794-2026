import { breakpoints } from './constants';

const hamburgerButtons = document.getElementsByClassName('header__hamburger');
const mask = document.querySelector('.mask');
const drawer = document.querySelector('.drawer');

function openDrawer() {
    if (window.innerWidth < breakpoints.medium) {
        // check if active class is not there
        if (!drawer.classList.contains('active')) {
            // add it
            drawer.classList.add('active');
            // add active class to mask element as well
            mask.classList.add('active');
            // remove inert attribute from the drawer;
            drawer.inert = false;
            // remove hidden attribute from the mask element as well
            mask.hidden = false;
        }
    }
}

function clearDrawerAndMaskClasses() {
    // check if active class is there
    if (drawer.classList.contains('active')) {
        // remove it
        drawer.classList.remove('active');
        // remove active class from the mask element as well
        mask.classList.remove('active');
        // add inert attribute to the drawer;
        drawer.inert = true;
        // add  hidden attribute to the mask element
        mask.hidden = true;
    }
}

function closeDrawer() {
    if (window.innerWidth < breakpoints.medium) {
        clearDrawerAndMaskClasses();
    }
}
// debaounced resize
let resizeTimer;
window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
        // Incase of resizing from tablet to desktop;
        if (window.innerWidth >= breakpoints.medium) {
            clearDrawerAndMaskClasses();
        }
    }, 400);
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
