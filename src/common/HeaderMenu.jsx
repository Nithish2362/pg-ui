import { ActionIcon, Menu, Select } from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { getpayLoadFromToken } from './JwtPayload';
import { createB2BAPI } from '../api/Interceptor';
import notify from '../components/settings/utils/Notification';
import moment from 'moment/moment';
import B2BSelect from './B2BSelect';

const routeJson = {
    "Create Sales order": { "path": "/sales/sales-order", "parentId": "3", "childParentId": "35" },
    "Sales order": { "path": "/sales/order-management", "parentId": "3", "childParentId": "35" },
    "Packing Slip": { "path": "/sales/view-packing", "parentId": "3", "childParentId": "37" },
    "Invoice": { "path": "/sales/view-invoice", "parentId": "3", "childParentId": "38" },
    "Shipment Note": { "path": "/sales/view-shippment", "parentId": "3", "childParentId": "39" },
    "Inventory": { "path": "/inventory/stocks", "parentId": "4", "childParentId": "52" },
};

const HeaderMenu = ({ onMenuClick }) => {
    const [filteredRoutes, setFilteredRoutes] = useState({});
    const data = useMemo(() => JSON.parse(localStorage.getItem("user"))?.views || [], []);
    const userId = useMemo(() => JSON.parse(localStorage.getItem("user"))?.userId || '', []);
    const [user, setUser] = useState({});
    const payload = useMemo(() => getpayLoadFromToken(), []);
    const B2B_API = createB2BAPI();
    const [fromLocation, setFromLocation] = useState([]);
    const [currentTime, setCurrentTime] = useState(moment());


    useEffect(() => {
        const paths = data?.map(item => item.path);
        if (paths) {
            const filtered = Object.keys(routeJson)
                .filter(route => paths.includes(routeJson[route].path))
                .reduce((acc, route) => {
                    acc[route] = routeJson[route];
                    return acc;
                }, {});

            setFilteredRoutes(filtered);
        }
    }, []);

    useEffect(() => {
        fetchFromLocation();
        fetchUser();
    }, [userId]);

    const handleSelectChange = async (locationId) => {
        try {
            const url = `user/locationUpdate?userId=${userId}&locationId=${locationId}`;
            const response = await B2B_API.get(url);

            if (response.status === 200) {
                notify({
                    title: 'Success!',
                    message: 'Location update successful.',
                    error: false,
                    success: true,
                });
                fetchUser();
            } else {
                notify({
                    title: 'Update Failed',
                    message: 'Could not update location. Please try again.',
                    color: 'red',
                });
            }
        } catch (error) {
            console.error("Error saving location:", error);
            notify({
                title: 'Error!',
                message: 'An unexpected error occurred.',
                error: true,
                success: false,
            });
        } finally {
            window.location.reload();
        }
    };


    const fetchUser = async () => {
        try {
            const res = await B2B_API.get(`user/${userId}`).json();
            setUser(res.response);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    const fetchFromLocation = async () => {
        try {
            const response = await B2B_API.get('company-location/get-all').json();
            setFromLocation(response.response || []);
        } catch (error) {
            console.error(error);
        }
    };
    const styleJson = useMemo(() => ({
        color: 'black',
        position: 'relative',
        top: '3rem',
        left: '1rem',
        width: '30px',
        height: '30px',
        borderRadius: '25px',
        backgroundColor: 'white',
        outline: 'none',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0px 0.5px 0px 1px #0780B2',
        fontSize: '16px'
    }), [data]);

    return (
        <>
            {Object.keys(filteredRoutes)?.length > 0 && (
                <Menu trigger="click-hover" openDelay={100} closeDelay={400}>
                    <Menu.Target>
                        <ActionIcon radius={50} size={"md"} style={styleJson}>
                            <IconBolt size={15} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        {Object.keys(filteredRoutes).map((menu, key) => (
                            <Menu.Item key={key} onClick={() => onMenuClick(filteredRoutes[menu])}>
                                {menu}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
            )}
            <div
                style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: '1.5rem' }}
                title="Warehouse Name"
            >
                <B2BSelect
                    placeholder="Select"
                    data={fromLocation.map(loc => ({
                        label: loc?.name,
                        value: loc?.companyLocationId,
                    }))}
                    value={user.locationId}
                    searchable
                    nothingFound="No locations found"
                    style={{ width: 150, padding: '15px' }}
                    disabled={payload?.ROLE !== "COMPANY_ADMIN"}
                    onChange={handleSelectChange}
                />
            </div>
        </>
    );
};

export default HeaderMenu