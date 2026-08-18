import { addMask, lockScroll, removeMask } from './utilities';

const triggerPoint = document.getElementById('special-deals');
const specialDealsModal = document.querySelector('.modal');
const mask = document.querySelector('.mask');

export const renderSpecialDeals = () => {
    addMask(false);
    lockScroll();
    specialDealsModal.classList.add('modal--active');
};

const closeModal = () => {
    if (specialDealsModal.classList.contains('modal--active')) {
        removeMask();
        specialDealsModal.classList.remove('modal--active');
    }
};

triggerPoint.addEventListener('click', renderSpecialDeals);
mask.addEventListener('click', closeModal);
