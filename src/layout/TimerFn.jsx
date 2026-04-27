import React, { useEffect, useState } from 'react';
import moment from 'moment';

const TimerFn = () => {
    const [currentTime, setCurrentTime] = useState();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(moment());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <span>{currentTime?.format('MMMM Do YYYY, h:mm:ss A')}</span>
    );
};

// ✅ Prevent parent re-render if props don't change
export default React.memo(TimerFn);
