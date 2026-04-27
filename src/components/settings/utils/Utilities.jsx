export const LogOut = () => {
    localStorage.clear()
    window.location = '/'
}

export const scrollToElement = (ref, offset = 0) => {
    if (ref?.current) {
        const elementPosition = ref.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth',
        });
    }
};
