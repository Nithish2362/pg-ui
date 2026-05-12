import { 
    IconDashboard, 
    IconBuilding, 
    IconUsers, 
    IconBell, 
    IconUserStar, 
    IconCash, 
    IconUser 
} from '@tabler/icons-react';

const ModuleJson = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role || '';
    const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
    const isStaff = role === 'STAFF';
    const isTenant = role === 'TENANT' || role === 'ROLE_TENANT';

    let mandatoryModules = [];

    if (isSuperAdmin) {
        mandatoryModules = [
            { id: 'DASHBOARD', name: 'Dashboard', parent_id: null, orderBy: 1, path: '/dashboard', icon: IconDashboard },
            { id: 'PROPERTY', name: 'Property', parent_id: null, orderBy: 2, path: '/property', defaultChildId: 'LOCATION', icon: IconBuilding },
            { id: 'RESIDENTS', name: 'Residents', parent_id: null, orderBy: 3, path: '/residents', defaultChildId: 'TENANTS', icon: IconUsers },
            { id: 'NOTIFICATIONS', name: 'Notifications', parent_id: null, orderBy: 4, path: '/notifications', icon: IconBell },
            { id: 'STAFF', name: 'Staff Details', parent_id: null, orderBy: 5, path: '/staff', icon: IconUserStar },
            { id: 'EXPENSES', name: 'Expense Details', parent_id: null, orderBy: 6, path: '/expenses', icon: IconCash },
            { id: 'PROFILE', name: 'Profile', parent_id: null, orderBy: 7, path: '/profile', icon: IconUser },

            // Property sub-tabs (Admin Only)
            { id: 'LOCATION', name: 'Location', parent_id: 'PROPERTY', orderBy: 1, path: '/locations' },
            { id: 'BUILDINGS', name: 'Buildings', parent_id: 'PROPERTY', orderBy: 2, path: '/buildings' },
            { id: 'FLOORS', name: 'Floors', parent_id: 'PROPERTY', orderBy: 3, path: '/floors' },
            { id: 'ROOMS', name: 'Rooms', parent_id: 'PROPERTY', orderBy: 4, path: '/rooms' },
            { id: 'BEDS', name: 'Beds', parent_id: 'PROPERTY', orderBy: 5, path: '/beds' },

            // Residents sub-tabs
            { id: 'TENANTS', name: 'Tenants', parent_id: 'RESIDENTS', orderBy: 1, path: '/tenants' },
            { id: 'PAYMENTS', name: 'Payments', parent_id: 'RESIDENTS', orderBy: 2, path: '/payments' },
        ];
    } else if (isStaff) {
        mandatoryModules = [
            { id: 'DASHBOARD', name: 'Dashboard', parent_id: null, orderBy: 1, path: '/dashboard', icon: IconDashboard },
            { id: 'RESIDENTS', name: 'Residents', parent_id: null, orderBy: 2, path: '/residents', defaultChildId: 'TENANTS', icon: IconUsers },
            { id: 'EXPENSES', name: 'My Expenses', parent_id: null, orderBy: 3, path: '/expenses', icon: IconCash },
            { id: 'NOTIFICATIONS', name: 'Notifications', parent_id: null, orderBy: 4, path: '/notifications', icon: IconBell },
            { id: 'PROFILE', name: 'Profile', parent_id: null, orderBy: 5, path: '/profile', icon: IconUser },

            // Residents sub-tabs
            { id: 'TENANTS', name: 'Tenants', parent_id: 'RESIDENTS', orderBy: 1, path: '/tenants' },
            { id: 'PAYMENTS', name: 'Payments', parent_id: 'RESIDENTS', orderBy: 2, path: '/payments' },
        ];
    } else if (isTenant) {
        mandatoryModules = [
            { id: 'TENANT_DASHBOARD', name: 'Dashboard', parent_id: null, orderBy: 1, path: '/tenant/dashboard', icon: IconDashboard },
            { id: 'TENANT_PAYMENTS', name: 'My Payments', parent_id: null, orderBy: 2, path: '/tenant/payments', icon: IconCash },
            { id: 'TENANT_PROFILE', name: 'My Profile', parent_id: null, orderBy: 3, path: '/profile', icon: IconUser },
        ];
    }

    return mandatoryModules;
};

export default ModuleJson;
