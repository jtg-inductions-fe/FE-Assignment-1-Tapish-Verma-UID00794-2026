import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { testimonialData } from './data/testimonials';

new Swiper('.swiper', {
    direction: 'horizontal',
    modules: [Navigation, Pagination, Autoplay],
    autoplay: {
        delay: 2000,
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
                    <img
                        class="testimonial-card__image"
                        src="${authorImgSrc}"
                        alt="${authorName}"
                    />

                    <div class="testimonial-card__content">
                        <h5 class="testimonial-card__author">
                            <span class="text-orange">
                                ${authorName}
                            </span>
                            / ${authorDesignation}
                        </h5>

                        <div
                            class="testimonial-card__stars"
                            aria-label="${rating} out of 5 stars"
                        >
                            ${Array.from(
                                { length: rating },
                                () =>
                                    `<span class="icon testimonial-card__stars--primary" aria-hidden="true"></span>`,
                            ).join('')}
                        </div>
                    </div>

                    <p class="testimonial-card__description">
                        ${comment}
                    </p>
                </article>
            </div>
        `,
    )
    .join('');
