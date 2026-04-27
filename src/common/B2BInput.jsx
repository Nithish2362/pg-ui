// import { TextInput } from '@mantine/core';
// import React, { useEffect, useRef } from 'react';

// const B2BInput = ({ value, name, className, style, styles, edit, onChange, placeholder, variant, required, error, type, radius, disabled, rightSection, label, withAsterisk, onKeyUp,barcodeInputRef, ...rest }) => {

//     const inputRef = useRef();
//     const inputSectionRef = useRef(null);

//     // useEffect(() => {

//     //     //for autoFocus in the Input Field
//     //     inputRef?.current?.focus();

//     //     // scroll down to the input Field
//     //     // inputSectionRef.current.scrollIntoView({ behaviour: 'smooth' })

//     // }, [inputRef])

//     return (
//         <TextInput
//             className={className}
//             label={label}
//             styles={{ input: { fontSize: '14px', cursor: edit === true ? 'not-allowed' : 'text', ...styles?.input } }}
//             placeholder={placeholder}
//             style={style}
//             value={value}
//             type={type}
//             variant={variant}
//             required={required}
//             size='md'
//             name={name}
//             radius={radius || "sm"}
//             autoComplete='new-password'
//             disabled={disabled}
//             onChange={onChange}
//             error={error}
//             rightSection={rightSection}
//             withAsterisk={withAsterisk}
//             onKeyUp={onKeyUp}
//             {...rest}
//             ref={inputRef}
//         />
//     );
// }

// export default B2BInput;

import { TextInput } from '@mantine/core';
import React, { forwardRef, useRef, useImperativeHandle } from 'react';

const B2BInput = forwardRef(({
    value,
    name,
    className,
    style,
    styles,
    edit,
    onChange,
    placeholder,
    variant,
    required,
    error,
    type,
    radius,
    disabled,
    rightSection,
    label,
    withAsterisk,
    onKeyUp,
    ...rest
}, ref) => {
    const inputRef = useRef(null);

    // Expose internal ref to parent
    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur()
    }));

    return (
        <TextInput
            className={className}
            label={label}
            styles={{
                input: {
                    fontSize: '14px',
                    cursor: edit === true ? 'not-allowed' : 'text',
                    ...styles?.input
                }
            }}
            placeholder={placeholder}
            style={style}
            value={value}
            type={type}
            variant={variant}
            required={required}
            size="md"
            name={name}
            radius={radius || 'sm'}
            autoComplete="new-password"
            disabled={disabled}
            onChange={onChange}
            error={error}
            rightSection={rightSection}
            withAsterisk={withAsterisk}
            onKeyUp={onKeyUp}
            {...rest}
            ref={inputRef}
        />
    );
});

export default B2BInput;
