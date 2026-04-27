import React from 'react'

const SupplyName = (value) => {
    const map = {
        readyStock: 'Ready Stock',
        vendorReadyStock: 'Vendor Stock',
        orderDriven: "Made To Order"

    };
    return map[value] || '-';
};

export default SupplyName;
