export const debounce = (fn, delay = 400) => {
    let timer;
    function debounced(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    }
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
};
