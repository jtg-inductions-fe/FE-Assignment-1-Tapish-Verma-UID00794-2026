import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { testimonialData } from './data/testimonials';
import { TESTIMONIALS_CAROUSEL_DELAY } from './constants';

new Swiper('.swiper', {
    direction: 'horizontal',
    modules: [Navigation, Pagination, Autoplay],
    autoplay: {
        delay: TESTIMONIALS_CAROUSEL_DELAY,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.next',
        prevEl: '.prev',
    },
});

const swipperWrapper = document.querySelector('.swiper-wrapper');

swipperWrapper.innerHTML = testimonialData
    .map(
        ({ authorImgSrc, authorName, authorDesignation, rating, comment }) => `
            <div class="swiper-slide">
                <article class="testimonial-card">
                    <div class="testimonial-card__image">
                        <img
                            src="${authorImgSrc}"
                            alt="${authorName}'s profile picture"
                        />
                    </div>

                    <div class="testimonial-card__content">
                        <div class="testimonial-card__author">
                            <span class="text-dark-bold text-orange">
                                ${authorName}
                            </span>
                            <span class="text-dark-bold text-dark-bold--small">&#47; ${authorDesignation}</span>
                        </div>

                        <div
                            class="testimonial-card__stars"
                            aria-label="${rating} out of 5 stars"
                        >
                            ${Array.from(
                                { length: rating },
                                () =>
                                    `<span class="icon-star testimonial-card__stars--primary" aria-hidden="true"></span>`,
                            ).join('')}
                        </div>
                    </div>

                    <p class="testimonial-card__description text-medium-bold-md font-circular-std">
                        ${comment}
                    </p>
                </article>
            </div>
        `,
    )
    .join('');
