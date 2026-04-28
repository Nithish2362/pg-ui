export const validateProductName = (value) => {
    const specialCharPattern = /[^a-zA-Z0-9\s]/;
    return !specialCharPattern.test(value);
};
export const validateProductDescription = (value) => {
    const specialCharPattern = /[^a-zA-Z0-9\s.,]/;
    return !specialCharPattern.test(value);
};