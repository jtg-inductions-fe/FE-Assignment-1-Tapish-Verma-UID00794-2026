import { addMask, lockScroll, unlockScroll, removeMask } from './utilities';

const triggerPoint = document.getElementById('special-deals');
const specialDealsModal = document.querySelector('.modal');
const modalCross = document.querySelector('.modal__cross');
const mask = document.querySelector('.mask');

export const renderSpecialDeals = () => {
    addMask(false);
    lockScroll();
    specialDealsModal.classList.add('modal--active');
    specialDealsModal.inert = false;
};

const closeModal = () => {
    if (specialDealsModal.classList.contains('modal--active')) {
        removeMask();
        unlockScroll();
        specialDealsModal.classList.remove('modal--active');
        specialDealsModal.inert = true;
    }
};

triggerPoint.addEventListener('click', renderSpecialDeals);
mask.addEventListener('click', closeModal);
modalCross.addEventListener('click', closeModal);
