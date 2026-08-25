import { breakpoints } from './constants';

const footerMenu = document.querySelector('.footer__menu');
const mobileMediaQuery = window.matchMedia(
    `(max-width: ${breakpoints.small}px)`,
);

/**
 * Opens the clicked footer accordion and updates its accessibility state.
 * Finds the corresponding content section using the button's data-target.
 *
 * @param {Event} event - The click event from the footer menu.
 */

function openAccordian(event) {
    const btn = event.target.closest('.footer__button');
    if (!btn) return;

    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
        closeAccordian(btn);
        return;
    }

    const targetKey = btn.dataset.target;
    const content = footerMenu.querySelector(
        `.footer__content[data-section="${targetKey}"]`,
    );
    if (!content) return;
    const dataLabel = btn.dataset.label;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', `Close ${dataLabel}`);
    btn.classList.add('footer__button--rotate');
    content.classList.add('footer__content--active');
    content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Opens the first footer accordion when the viewport width is 430px or less.
 * Re-evaluates the state whenever the viewport crosses the 430px breakpoint.
 */

function handleOpenFirstAccordian() {
    const firstButton = footerMenu.querySelector('.footer__button');
    if (!firstButton) return;

    if (mobileMediaQuery.matches) {
        const isOpen = firstButton.getAttribute('aria-expanded') === 'true';

        if (!isOpen) {
            firstButton.click();
        }
    }
}

/**
 * Closes a footer accordion and resets its accessibility and visual state.
 *
 * @param {HTMLElement} btn - The accordion button to close.
 */

function closeAccordian(btn) {
    const targetKey = btn.dataset.target;
    const content = footerMenu.querySelector(
        `.footer__content[data-section="${targetKey}"]`,
    );
    if (!content) return;
    const dataLabel = btn.dataset.label;

    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', `Open ${dataLabel}`);
    btn.classList.remove('footer__button--rotate');
    content.classList.remove('footer__content--active');
}

footerMenu.addEventListener('click', openAccordian);
mobileMediaQuery.addEventListener('change', handleOpenFirstAccordian);
