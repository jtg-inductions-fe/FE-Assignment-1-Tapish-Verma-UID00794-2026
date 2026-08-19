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
} from './constants';

const triggerPoint = document.getElementById('special-deals');
const specialDealsModal = document.querySelector('.modal');
const modalCross = document.querySelector('.modal__cross');
const mask = document.querySelector('.mask');
const spinner = document.querySelector('.spinner');
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
        isFirstSpinDone: false,
    };

    const renderRelevantModal = () => {
        switch (modalMetaData.modalTypes[modalMetaData.currentActiveModalIdx]) {
            case MODAL_TYPE_SPIN_AND_WIN:
                renderSpecialDeals();
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

    const getSpinStatus = () => modalMetaData.isFirstSpinDone;
    const setSpinStatus = (val) => (modalMetaData.isFirstSpinDone = val);

    return {
        nextModal,
        prevModal,
        renderRelevantModal,
        setCurrentActiveModalIdx,
        getSelectedDeals,
        setSelectedDeals,
        getSpinStatus,
        setSpinStatus,
    };
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

const renderUnlockedDeals = () => {
    // clear eventlistener on unlocked button
    const unlockedDealsButton = document.querySelector('.modal__button');
    unlockedDealsButton.removeEventListener('click', modalHandler.nextModal);

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

        modalBody.insertAdjacentHTML(
            'beforeend',
            userWonDeals
                .map(
                    (deal) =>
                        `
                <div class="${deal.validFor === null ? 'spinner__deal--expired' : 'spinner__deal'}">
                    <div class="spinner__deal-left-section">
                        <span class="spinner__deal-label text-medium-bold-sm">${deal.label}</span>
                        <span class="spinner__deal-expiry text-light-sm ${deal.validFor === null ? 'text-light-sm' : 'text-light-sm--purple'}">${deal.validFor === null ? 'Deal Expired' : `Expires in ${deal.validFor}d`}</span>
                    </div>
                    <div class="spinner__deal-right-section">
                        <span class="spinner__deal-tag text-bold-sm font-roboto">${deal.promoCode}</span>
                        <button class="button button--icon-only spinner__deal-button">
                            <span class="icon-Copy spinner__copy ${deal.validFor === null ? 'spinner__copy' : 'spinner__copy--active'}"></span>
                        </button>
                    </div>
                </div>
            `,
                )
                .join(''),
        );
    }

    unlockedDealsButton.innerHTML = 'Go Back';
    unlockedDealsButton.addEventListener('click', modalHandler.prevModal);
};

const handleSpinWin = (winner) => {
    const spinnerResultSectionLength = spinnerResultSection.innerHTML.length;
    if (spinnerResultSectionLength === 0) {
        spinnerResultSection.insertAdjacentHTML(
            'beforeend',
            `<span class="text-bold-sm" >You Won!</span>`,
        );
    }

    spinnerResultSection.insertAdjacentHTML(
        'beforeend',
        `
            <div class="spinner__deal">
                <div class="spinner__deal-left-section">
                    <span class="spinner__deal-label text-medium-bold-sm">${winner.label}</span>
                    <span class="spinner__deal-expiry text-light-sm text-light-sm--purple">Expires in ${winner.validFor}d</span>
                </div>
                <div class="spinner__deal-right-section">
                    <span class="spinner__deal-tag text-bold-sm font-roboto">${winner.promoCode}</span>
                    <button class="button button--icon-only spinner__deal-button">
                        <span class="icon-Copy spinner__copy spinner__copy--active"></span>
                    </button>
                </div>
            </div>
        `,
    );
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
};

const handleSpinWheel = async (selectedDeals) => {
    let rotation = 0;
    let velocity = 0;
    let _selectedDeals;

    if (modalHandler.getSpinStatus()) {
        _selectedDeals = await getFilteredSpecialDeals();
    } else {
        _selectedDeals = selectedDeals;
        modalHandler.setSelectedDeals([..._selectedDeals]);
        modalHandler.setSpinStatus(true);
    }

    function finishSpin() {
        const normalized = rotation % COMPLETE_ANGLE;
        const pointerAngle = (COMPLETE_ANGLE - normalized) % COMPLETE_ANGLE;

        const segments = _selectedDeals.map((deal, idx) => ({
            ...deal,
            ...SEGMENTS[idx],
        }));

        const winner = segments.find(
            (s) => pointerAngle >= s.min && pointerAngle < s.max,
        );
        handleSpinWin(winner);
    }

    function tick() {
        if (velocity > STOP_THRESHOLD) {
            rotation += velocity;
            velocity *= DECAY;
            spinnerOuterContainer.style.transform = `rotate(${rotation}deg)`;
            requestAnimationFrame(tick);
        } else {
            finishSpin();
        }
    }
    velocity = 25 + Math.random() * 20;
    requestAnimationFrame(tick);
};

function addUnlockedDealsButton() {
    let unlockedDealsButton = document.querySelector('.modal__button');
    let userWonDeals = getFromStorage(USER_WON_DEALS, []);
    if (userWonDeals.length === 0) {
        return;
    }
    if (unlockedDealsButton) {
        unlockedDealsButton.innerHTML = `<span>View Unlocked Deals</span> <span class="modal__count-badge">${userWonDeals.length}</span>`;
        return;
    }
    unlockedDealsButton = document.createElement('button');
    unlockedDealsButton.classList.add(
        'button',
        'button--outline',
        'modal__button',
        'font-figtree',
    );
    unlockedDealsButton.innerHTML = `<span>View Unlocked Deals</span> <span class="modal__count-badge">${userWonDeals.length}</span>`;
    unlockedDealsButton.addEventListener('click', modalHandler.nextModal);
    modalFooter.appendChild(unlockedDealsButton);
}

async function getFilteredSpecialDeals(dealsFromState = []) {
    if (dealsFromState.length > 0) {
        spinnerInnerContainer.innerHTML = dealsFromState
            .map(
                ({ label }) =>
                    `
                <div class="spinner__cell">
                    <span
                        class="spinner__cell-text text-sm text-sm--white"
                        >${label}</span
                    >
                </div>
            `,
            )
            .join('');
        return dealsFromState;
    }

    let specialDeals = getFromStorage(SPECIAL_DEALS_LABEL, []);
    if (specialDeals.length === 0) {
        spinnerInnerContainer.innerHTML = `<div>Loading</div>`;
        specialDeals = await fetchSpecialDeals();
        if (specialDeals.length === 0) {
            spinnerInnerContainer.innerHTML = `<div>NO Special Deals</div>`;
            return;
        }
    }

    // Render Special Deals
    const ValidDeals = specialDeals.filter((deal) => deal?.validFor !== null);
    const userWonDeals = getFromStorage(USER_WON_DEALS, []);
    const promoCodeList = userWonDeals.map((deal) => deal.promoCode);
    const remainingDeals = ValidDeals.filter(
        (deal) => !promoCodeList.includes(deal?.promoCode),
    );
    const selectedDeals = getRandomElements(remainingDeals, 4);

    spinnerInnerContainer.innerHTML = selectedDeals
        .map(
            ({ label }) =>
                `
                <div class="spinner__cell">
                    <span
                        class="spinner__cell-text text-sm text-sm--white"
                        >${label}</span
                    >
                </div>
            `,
        )
        .join('');

    return selectedDeals;
}

const renderSpecialDeals = async () => {
    // clear eventlistener on unlocked button
    const unlockedDealsButton = document.querySelector('.modal__button');
    if (unlockedDealsButton) {
        unlockedDealsButton.removeEventListener(
            'click',
            modalHandler.prevModal,
        );
    }

    //Render Header
    renderModalHeader(MODAL_TYPE_SPIN_AND_WIN);

    //Render spinner
    spinner.classList.remove('spinner--inactive');
    const dealsFromState = modalHandler.getSelectedDeals();
    const selectedDeals = await getFilteredSpecialDeals(dealsFromState);

    spinnerOuterContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="spinner__button">Spin</button>`,
    );
    const spinnerButton = document.querySelector('.spinner__button');
    spinnerButton.addEventListener('click', () =>
        handleSpinWheel(selectedDeals),
    );
    addUnlockedDealsButton();
};

const modalHandler = _modalHandler();
export const renderSpecialDealsModal = () => {
    addMask(false);
    lockScroll();
    specialDealsModal.classList.add('modal--active');
    specialDealsModal.inert = false;
    modalHandler.renderRelevantModal();
};

const closeModal = () => {
    if (specialDealsModal.classList.contains('modal--active')) {
        removeMask();
        unlockScroll();
        specialDealsModal.classList.remove('modal--active');
        specialDealsModal.inert = true;
        modalHandler.setCurrentActiveModalIdx(0);
        modalHandler.setSelectedDeals([]);
        modalHandler.setSpinStatus(false);
    }
};

triggerPoint.addEventListener('click', renderSpecialDealsModal);
mask.addEventListener('click', closeModal);
modalCross.addEventListener('click', closeModal);
