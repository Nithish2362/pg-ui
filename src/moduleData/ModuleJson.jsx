import _ from "lodash";

export function ModuleJson(parentId) {
    const user = JSON.parse(localStorage.getItem("user"));
    const data = (Array.isArray(user?.views) && user.views.length > 0) ? user.views : [
        { id: 'DASHBOARD', name: 'Dashboard', parent_id: null, orderBy: 1, path: '/dashboard' },
        { id: 'TENANTS', name: 'Tenants', parent_id: null, orderBy: 2, path: '/tenants' },
        { id: 'COMPLAINTS', name: 'Complaints', parent_id: null, orderBy: 3, path: '/complaints' },
        { id: 'VISITORS', name: 'Visitors', parent_id: null, orderBy: 4, path: '/visitors' },
        { id: 'NOTICES', name: 'Notices', parent_id: null, orderBy: 5, path: '/notices' },
        { id: 'LOGS', name: 'Logs', parent_id: null, orderBy: 6, path: '/logs' },
        { id: 'ROOMS', name: 'Rooms', parent_id: null, orderBy: 7, path: '/rooms' },
        { id: 'BEDS', name: 'Beds', parent_id: null, orderBy: 8, path: '/beds' },
    ];

    const normalizeParent = (value) => {
        if (value === undefined || value === null || value === "" || value === "null") {
            return null;
        }
        return String(value);
    };

    function buildTree(data, parentId = null) {
        const normalizedParentId = normalizeParent(parentId);
        return _.chain(data)
            .filter(item => normalizeParent(item.parent_id ?? item.parentId) === normalizedParentId)
            .sortBy('orderBy')
            .map(item => ({
                ...item,
                children: buildTree(data, item.id)
            }))
            .value();
    }

    return buildTree(data, parentId);
}
