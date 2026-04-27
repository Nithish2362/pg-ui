// import { faCalendar } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { DateInput } from '@mantine/dates';
// import dayjs from 'dayjs';
// import React from 'react';

// const B2BDateInput = ({label, value, placeholder,onChange, required }) => {
//     const dateParser = (input) => {
//         if (input === 'WW2') {
//             return new Date(1939, 8, 1);
//         }
//         return dayjs(input, 'DD/MM/YYYY').toDate();
//     };

//     return (

//         <DateInput
//             className="input-textField"
//             dateParser={dateParser}
//             value={value}
//             label={label}
//             required={required}
//             rightSection={<FontAwesomeIcon icon={faCalendar} />}
//             rightSectionPointerEvents="none"
//             valueFormat="DD/MM/YYYY"
//             onChange={onChange}
//             placeholder={placeholder}
//             clearable
//             radius="sm"
//             size='md'
//         />
//     );
// };

// export default B2BDateInput;


import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import React from 'react';

const B2BDateInput = ({ label, value, placeholder, onChange, required, minDate, mt, size, maxDate, className, disabled,error }) => {
    const parsedValue = value ? dayjs(Number(value)).toDate() : null;

    const dateParser = (input) => {
        if (input === 'WW2') {
            return new Date(1939, 8, 1);
        }
        return dayjs(input, 'DD/MM/YYYY').toDate();
    };

    return (
        <DateInput
            className={className || "input-textField"}
            dateParser={dateParser}
            value={parsedValue}
            label={label}
            minDate={minDate}
            required={required}
            rightSection={<FontAwesomeIcon icon={faCalendar} />}
            rightSectionPointerEvents="none"
            valueFormat="DD/MM/YYYY"
            onChange={onChange}
            placeholder={placeholder}
            clearable
            radius="sm"
            size={size || 'sm'}
            maxDate={maxDate}
            disabled={disabled}
            error={error}
            mt={mt}
        />
    );
};

export default B2BDateInput;
