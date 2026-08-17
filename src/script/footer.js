const footerMenu = document.querySelector('.footer__menu');

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

    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('footer__button--rotate');
    content.classList.add('footer__content--active');
    content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeAccordian(btn) {
    const targetKey = btn.dataset.target;
    const content = footerMenu.querySelector(
        `.footer__content[data-section="${targetKey}"]`,
    );
    if (!content) return;

    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('footer__button--rotate');
    content.classList.remove('footer__content--active');
}

footerMenu.addEventListener('click', openAccordian);
