import {
    addMask,
    lockScroll,
    unlockScroll,
    removeMask,
    getFromStorage,
    getRandomElements,
    saveToStorage,
} from './utilities';
import {
    SPECIAL_DEALS_LABEL,
    USER_WON_DEALS,
    API_ENDPOINT,
    MODAL_TYPE_UNLOCKED_DEALS,
    MODAL_TYPE_SPIN_AND_WIN,
    DECAY,
    STOP_THRESHOLD,
    SEGMENTS,
    COMPLETE_ANGLE,
    QUATER_ANGLE,
    BORDER_EPSILON,
    SEGMENTS_SIZE,
} from './constants';

const triggerPoint = document.getElementById('special-deals');
const specialDealsModal = document.querySelector('.modal');
const modalCross = document.querySelector('.modal__cross');
const mask = document.querySelector('.mask');
const spinner = document.querySelector('.spinner');
const spinerMarker = document.querySelector('.spinner__marker');
const spinnerInnerContainer = document.querySelector(
    '.spinner__inner-container',
);
const spinnerOuterContainer = document.querySelector(
    '.spinner__outer-container',
);
const modalFooter = document.querySelector('.modal__footer');
const modalSubTitle = document.querySelector('.modal__header-sub-title');
const modalDescription = document.querySelector('.modal__header-decription');
const modalBody = document.querySelector('.modal__body');
const spinnerResultSection = document.querySelector('.spinner__result');

const fetchSpecialDeals = async () => {
    try {
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        saveToStorage(SPECIAL_DEALS_LABEL, data);

        return data;
    } catch {
        return [];
    }
};

const _modalHandler = () => {
    const modalMetaData = {
        modalTypes: [MODAL_TYPE_SPIN_AND_WIN, MODAL_TYPE_UNLOCKED_DEALS],
        currentActiveModalIdx: 0,
        selectedDeals: [],
        shouldInitializeWheel: true,
        lastFocused: null,
    };

    const renderRelevantModal = async () => {
        switch (modalMetaData.modalTypes[modalMetaData.currentActiveModalIdx]) {
            case MODAL_TYPE_SPIN_AND_WIN:
                await renderSpecialDeals();
                break;
            case MODAL_TYPE_UNLOCKED_DEALS:
                renderUnlockedDeals();
                break;
        }
    };

    const nextModal = () => {
        if (
            modalMetaData.currentActiveModalIdx >=
            modalMetaData.modalTypes.length - 1
        ) {
            return;
        }
        modalMetaData.currentActiveModalIdx += 1;
        renderRelevantModal();
    };

    const prevModal = () => {
        if (modalMetaData.currentActiveModalIdx <= 0) {
            return;
        }
        modalMetaData.currentActiveModalIdx -= 1;
        renderRelevantModal();
    };

    const setCurrentActiveModalIdx = (idx) => {
        modalMetaData.currentActiveModalIdx = idx;
    };

    const getSelectedDeals = () => {
        return modalMetaData.selectedDeals;
    };

    const setSelectedDeals = (deals) => {
        modalMetaData.selectedDeals = [...deals];
    };

    const getSpinStatus = () => modalMetaData.shouldInitializeWheel;
    const setSpinStatus = (val) => (modalMetaData.shouldInitializeWheel = val);
    const getLastFocused = () => modalMetaData.lastFocused;
    const setLastFocused = (val) => (modalMetaData.lastFocused = val);

    return {
        nextModal,
        prevModal,
        renderRelevantModal,
        setCurrentActiveModalIdx,
        getSelectedDeals,
        setSelectedDeals,
        getSpinStatus,
        setSpinStatus,
        getLastFocused,
        setLastFocused,
    };
};

const handleCopyClick = (event) => {
    const button = event.target.closest('.spinner__deal-button');

    if (!button) {
        return;
    }

    const promoCode = button.dataset.promoCode;
    const icon = button.querySelector('.icon-Copy');
    icon.classList.remove(
        'icon-Copy',
        'spinner__copy',
        'spinner__copy--active',
    );
    icon.classList.add('icon-tick', 'spinner__tick');
    button.setAttribute('aria-label', 'Promo code copied');
    button.disabled = true;

    navigator.clipboard.writeText(promoCode);
};

const renderModalHeader = (modalType) => {
    let modalHeaderSubTitle = '';
    let modalHeaderDescription = '';
    switch (modalType) {
        case MODAL_TYPE_SPIN_AND_WIN:
            modalHeaderSubTitle = 'Spin & Win!';
            modalHeaderDescription = 'Tap the center of the wheel to spin';
            break;
        case MODAL_TYPE_UNLOCKED_DEALS:
            modalHeaderSubTitle = 'Unlocked Deals';
            modalHeaderDescription = 'All the deals you’ve unlocked yet!';
    }
    modalSubTitle.innerHTML = modalHeaderSubTitle;
    modalDescription.innerHTML = modalHeaderDescription;
};

const renderResultSectionList = (deals, replace = false) => {
    let resultDealsList = spinnerResultSection.querySelector(
        '.spinner__result-list',
    );

    if (!resultDealsList) {
        spinnerResultSection.insertAdjacentHTML(
            'beforeend',
            '<div class="spinner__result-list"></div>',
        );
        resultDealsList = spinnerResultSection.querySelector(
            '.spinner__result-list',
        );
        spinnerResultSection.addEventListener('click', handleCopyClick);
    }

    const dealsHTML = deals
        .map(
            (deal) =>
                `
                <div class="spinner__deal ${deal.validFor === null ? 'spinner__deal--expired' : ''}">
                    <div class="spinner__deal-left-section">
                        <span class="spinner__deal-label text-medium-bold-sm">${deal.label}</span>
                        <span class="spinner__deal-expiry text-light-sm ${deal.validFor === null ? 'text-light-sm' : 'text-light-sm--purple'}">${deal.validFor === null ? 'Deal Expired' : `Expires in ${deal.validFor}d`}</span>
                    </div>
                    <div class="spinner__deal-right-section">
                        <span class="spinner__deal-tag text-bold-sm font-roboto">${deal.promoCode}</span>
                        <button class="button button--icon-only spinner__deal-button" ${deal.promoCode === null || typeof deal.validFor !== 'number' ? 'disabled' : ''} aria-label="Copy promo code" data-promo-code="${deal.promoCode}">
                            <span class="icon-Copy spinner__copy ${deal.validFor === null ? 'spinner__copy' : 'spinner__copy--active'}"></span>
                        </button>
                    </div>
                </div>
            `,
        )
        .join('');

    if (replace) {
        resultDealsList.innerHTML = dealsHTML;
    } else {
        resultDealsList.insertAdjacentHTML('beforeend', dealsHTML);
    }
};

const renderUnlockedDeals = () => {
    // clear eventlistener on unlocked button
    const unlockedDealsButton = document.querySelector('.modal__button');
    unlockedDealsButton.removeEventListener('click', modalHandler.nextModal);

    //Clear and disables result section
    spinnerResultSection.innerHTML = '';
    spinnerResultSection.classList.add('spinner__result--active');

    // Remove spinner Highlights;
    const spinnerHighlights = modalBody.querySelector('.spinner__highlights');
    if (spinnerHighlights) {
        spinnerHighlights.remove();
    }

    //Render Header
    renderModalHeader(MODAL_TYPE_UNLOCKED_DEALS);

    //Hide Spinner div
    spinner.classList.add('spinner--inactive');

    //Render UserWonDeals
    const userWonDeals = getFromStorage(USER_WON_DEALS, []);
    if (userWonDeals.length === 0) {
        modalBody.insertAdjacentHTML(
            'beforeend',
            '<div>No Unlocked Deals</div>',
        );
    } else {
        userWonDeals.sort((a, b) => {
            if (a.validFor === null) return 1;
            if (b.validFor === null) return -1;

            return b.validFor - a.validFor;
        });

        renderResultSectionList(userWonDeals);
    }

    unlockedDealsButton.innerHTML = 'Go Back';
    unlockedDealsButton.addEventListener('click', modalHandler.prevModal);
};

function updateResultSectionSpan(status = 'won') {
    let firstChild = spinnerResultSection.firstElementChild;
    spinnerResultSection.classList.add('spinner__result--active');
    if (!(firstChild && firstChild.tagName === 'SPAN')) {
        spinnerResultSection.insertAdjacentHTML(
            'afterbegin',
            `<span class="text-bold-sm result__status" ></span>`,
        );
        firstChild = spinnerResultSection.querySelector('.result__status');
    }
    if (status === 'won') {
        firstChild.textContent = 'You Won!';
        modalHandler.setSpinStatus(true);
    } else if (status === 're-spin') {
        firstChild.textContent = 'Please Spin Again!';
    }
}

const handleSpinWin = (winner) => {
    updateResultSectionSpan('won');
    renderResultSectionList([winner], true);
    spinnerResultSection.classList.add('spinner__result--active');

    const previosWonDeals = getFromStorage(USER_WON_DEALS, []);
    saveToStorage(USER_WON_DEALS, [
        ...previosWonDeals,
        {
            label: winner.label,
            promoCode: winner.promoCode,
            validFor: winner.validFor,
        },
    ]);
    addUnlockedDealsButton();
    addFooterButtonListener(modalHandler.nextModal);
};

const handleSpinWheel = async () => {
    let rotation = 0;
    let velocity = 0;

    if (modalHandler.getSpinStatus()) {
        await renderSpinningWheel();
    }

    // Disable the spinnerButton
    const spinnerButton =
        spinnerOuterContainer.querySelector('.spinner__button');
    spinnerButton.disabled = true;

    async function finishSpin() {
        const normalized = rotation % COMPLETE_ANGLE;
        const pointerAngle = (COMPLETE_ANGLE - normalized) % COMPLETE_ANGLE;
        const selectedDeals = modalHandler.getSelectedDeals();
        const segments = selectedDeals.map((deal, idx) => ({
            ...deal,
            ...SEGMENTS[idx],
        }));

        const winner = segments.find(
            (s) => pointerAngle >= s.min && pointerAngle < s.max,
        );
        handleSpinWin(winner);
        spinnerButton.disabled = false;
        // Disable the spin button of spinner
        const validDeals = getValidLockedDeals();
        if (validDeals.length < SEGMENTS_SIZE) {
            //Hide Spinner div
            spinner.classList.add('spinner--inactive');
            modalBody.insertAdjacentHTML(
                'afterbegin',
                `<p class="spinner__highlights text-light-sm ">Oops! You are out of spins.</p>`,
            );
        }
    }

    function tick() {
        if (velocity > STOP_THRESHOLD) {
            rotation += velocity;
            velocity *= DECAY;
            spinnerOuterContainer.style.transform = `rotate(${rotation}deg)`;
            requestAnimationFrame(tick);
        } else {
            if (rotation % QUATER_ANGLE === 0) {
                rotation += BORDER_EPSILON;
                spinnerOuterContainer.style.transform = `rotate(${rotation}deg)`;
            }
            finishSpin();
        }
    }
    velocity = 25 + Math.random() * 20;
    requestAnimationFrame(tick);
};

const addFooterButtonListener = (fn) => {
    const footerButton = modalFooter.querySelector('.modal__button');
    if (footerButton) {
        footerButton.addEventListener('click', fn);
    }
};

function addUnlockedDealsButton() {
    let unlockedDealsButton = document.querySelector('.modal__button');
    let userWonDeals = getFromStorage(USER_WON_DEALS, []);
    if (userWonDeals.length === 0) {
        return;
    }
    if (!unlockedDealsButton) {
        unlockedDealsButton = document.createElement('button');
        unlockedDealsButton.classList.add(
            'button',
            'button--outline',
            'modal__button',
            'font-figtree',
        );
        modalFooter.appendChild(unlockedDealsButton);
    }
    unlockedDealsButton.innerHTML = `<span>View Unlocked Deals</span> <span class="modal__count-badge">${userWonDeals.length}</span>`;
}

function getValidLockedDeals() {
    let specialDeals = getFromStorage(SPECIAL_DEALS_LABEL, []);
    const validDeals = specialDeals.filter((deal) => deal?.validFor !== null);
    const userWonDeals = getFromStorage(USER_WON_DEALS, []);
    const promoCodeList = userWonDeals.map((deal) => deal.promoCode);
    const remainingDeals = validDeals.filter(
        (deal) => !promoCodeList.includes(deal?.promoCode),
    );

    return remainingDeals;
}

async function renderSpinningWheel() {
    // rotate the outer container back to 0 degree
    spinnerOuterContainer.style.transform = 'rotate(0deg)';
    let selectedDeals;
    let remainingDeals;
    if (modalHandler.getSpinStatus()) {
        let specialDeals = getFromStorage(SPECIAL_DEALS_LABEL, []);
        if (specialDeals.length === 0) {
            spinnerInnerContainer.classList.remove(
                'spinner__inner-container--shadow',
            );
            spinnerInnerContainer.classList.add(
                'spinner__inner-container--loading',
            );
            spinerMarker.classList.remove('spinner__marker--active');
            spinnerInnerContainer.innerHTML = `<div class="text-bold-sm">Loading...</div>`;

            specialDeals = await fetchSpecialDeals();
            if (specialDeals.length === 0) {
                spinnerInnerContainer.innerHTML = `<div class="text-bold-sm" >No Special Deals</div>`;
                return;
            }
            spinnerInnerContainer.innerHTML = ``;
        }

        spinerMarker.classList.add('spinner__marker--active');
        spinnerInnerContainer.classList.remove(
            'spinner__inner-container--loading',
        );
        spinnerInnerContainer.classList.add('spinner__inner-container--shadow');

        remainingDeals = getValidLockedDeals();
        if (remainingDeals.length < SEGMENTS_SIZE) {
            //Hide Spinner div
            spinner.classList.add('spinner--inactive');
            modalBody.insertAdjacentHTML(
                'afterbegin',
                `<p class="spinner__highlights text-light-sm ">Oops! You are out of spins.</p>`,
            );
            modalHandler.setSpinStatus(true);
            return;
        } else {
            selectedDeals = getRandomElements(remainingDeals, SEGMENTS_SIZE);
        }
        modalHandler.setSpinStatus(false);
        modalHandler.setSelectedDeals([...selectedDeals]);
    } else {
        selectedDeals = modalHandler.getSelectedDeals();
    }

    let spinnerButton = spinnerOuterContainer.querySelector('.spinner__button');
    if (!spinnerButton) {
        spinnerOuterContainer.insertAdjacentHTML(
            'beforeend',
            `<button class="button spinner__button">Spin</button>`,
        );
        spinnerButton = spinnerOuterContainer.querySelector('.spinner__button');
        spinnerButton.addEventListener('click', handleSpinWheel);
    }

    if (selectedDeals.length === 0) {
        spinnerButton.disabled = true;
    } else {
        spinnerButton.disabled = false;
    }

    spinnerInnerContainer.innerHTML = selectedDeals
        .map(
            ({ label, className }) =>
                `
            <div class="spinner__cell">
                <span
                    class="spinner__cell-text text-sm text-sm--white ${className ?? ''}"
                    >${label ?? ''}</span
                >
            </div>
        `,
        )
        .join('');
}

const renderSpecialDeals = async () => {
    // clear eventlistener on unlocked button
    const goBackButton = document.querySelector('.modal__button');
    if (goBackButton) {
        goBackButton.removeEventListener('click', modalHandler.prevModal);
    }

    //clear resultSectionList previously rendered deals (won or unlocked deals)
    const resultSectionList = spinnerResultSection.querySelector(
        '.spinner__result-list',
    );
    if (resultSectionList) {
        resultSectionList.innerHTML = '';
    }

    spinnerResultSection.classList.remove('spinner__result--active');

    //Render Header
    renderModalHeader(MODAL_TYPE_SPIN_AND_WIN);

    //Render spinner
    spinner.classList.remove('spinner--inactive');
    await renderSpinningWheel();
    addUnlockedDealsButton();
    addFooterButtonListener(modalHandler.nextModal);
};

const modalHandler = _modalHandler();

const nextFrame = () =>
    new Promise((resolve) => requestAnimationFrame(resolve));
export const renderSpecialDealsModal = async (event) => {
    modalHandler.setLastFocused(event.currentTarget);
    addMask(false);
    lockScroll();
    specialDealsModal.classList.add('modal--active');
    specialDealsModal.inert = false;
    await modalHandler.renderRelevantModal();
    // subsequent descendants donot get synchronously non inert on same tick, therefore we need to wait for some frames so that he modalCross is non inert and focusable.
    await nextFrame();
    await nextFrame();
    modalCross.focus();
};

const closeModal = () => {
    if (specialDealsModal.classList.contains('modal--active')) {
        const elementToRefocus = modalHandler.getLastFocused();
        if (elementToRefocus) {
            elementToRefocus.focus();
            modalHandler.setLastFocused(null);
        }

        removeMask();
        unlockScroll();
        specialDealsModal.classList.remove('modal--active');
        spinnerResultSection.innerHTML = '';
        specialDealsModal.inert = true;
        spinnerOuterContainer.style.transform = 'rotate(0deg)';
        modalHandler.setCurrentActiveModalIdx(0);
        modalHandler.setSelectedDeals([]);
        modalHandler.setSpinStatus(true);

        const footerButton = modalFooter.querySelector('.modal__button');
        if (footerButton) {
            footerButton.removeEventListener('click', modalHandler.nextModal);
            footerButton.removeEventListener('click', modalHandler.prevModal);
        }
    }
};

triggerPoint.addEventListener('click', renderSpecialDealsModal);
mask.addEventListener('click', closeModal);
modalCross.addEventListener('click', closeModal);
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});
