import _ from "lodash";

export function ModuleJson(parentId) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const backendViews = Array.isArray(user?.views) ? user.views : [];

    // Core mandatory hierarchy
    const mandatoryModules = [
        // Roots (Top Level)
        { id: 'DASHBOARD', name: 'Dashboard', parent_id: null, orderBy: 1, path: '/dashboard' },
        { id: 'PROPERTY', name: 'Property', parent_id: null, orderBy: 2, path: '/property', defaultChildId: 'TENANTS' },
        { id: 'COMMUNITY', name: 'Community', parent_id: null, orderBy: 3, path: '/community', defaultChildId: 'COMPLAINTS' },

        // Property Sub-items
        {
            id: 'TENANTS', name: 'Residents', parent_id: 'PROPERTY', orderBy: 1, path: '/tenants', children: [
                { id: 'ADD_TENANT', name: 'Add Resident', parent_id: 'TENANTS', path: '/tenants', type: 'button' }
            ]
        },
        { id: 'ROOMS', name: 'Rooms', parent_id: 'PROPERTY', orderBy: 2, path: '/rooms' },
        { id: 'BEDS', name: 'Beds', parent_id: 'PROPERTY', orderBy: 3, path: '/beds' },

        // Community Sub-items
        {
            id: 'COMPLAINTS', name: 'Complaints', parent_id: 'COMMUNITY', orderBy: 1, path: '/complaints', children: [
                { id: 'ADD_COMPLAINT', name: 'Add Complaint', parent_id: 'COMPLAINTS', path: '/complaints', type: 'button' }
            ]
        },
        {
            id: 'VISITORS', name: 'Visitors', parent_id: 'COMMUNITY', orderBy: 2, path: '/visitors', children: [
                { id: 'ADD_VISITOR', name: 'Add Visitor', parent_id: 'VISITORS', path: '/visitors', type: 'button' }
            ]
        },
        {
            id: 'NOTICES', name: 'Notices', parent_id: 'COMMUNITY', orderBy: 3, path: '/notices', children: [
                { id: 'ADD_NOTICE', name: 'Add Notice', parent_id: 'NOTICES', path: '/notices', type: 'button' }
            ]
        },
        { id: 'LOGS', name: 'Logs', parent_id: 'COMMUNITY', orderBy: 4, path: '/logs' },
    ];

    const normalizePath = (p) => {
        if (!p) return null;
        let path = String(p).toLowerCase().trim();
        if (!path.startsWith('/')) path = '/' + path;
        return path;
    };

    // Use a Map keyed by normalized PATH to strictly prevent duplicates
    const moduleMap = new Map();

    // 1. Add mandatory modules
    mandatoryModules.forEach(m => {
        const path = normalizePath(m.path);
        moduleMap.set(path, {
            ...m,
            id: String(m.id).toUpperCase(),
            path,
            parent_id: m.parent_id ? String(m.parent_id).toUpperCase() : null
        });
    });

    // 2. Merge backend views (by path to ensure uniqueness)
    backendViews.forEach(m => {
        const path = normalizePath(m.path);
        if (path) {
            const existing = moduleMap.get(path);
            moduleMap.set(path, {
                ...m,
                id: m.id ? String(m.id).toUpperCase() : (existing?.id || Math.random().toString()),
                path,
                // Keep mandatory parent_id if it exists to maintain the hierarchy
                parent_id: existing?.parent_id || (m.parent_id ? String(m.parent_id).toUpperCase() : null)
            });
        }
    });

    const data = Array.from(moduleMap.values());

    const normalize = (val) => {
        if (!val || val === "null" || val === "NULL") return null;
        return String(val).toUpperCase();
    };

    function buildTree(items, pid = null) {
        const targetPid = normalize(pid);
        return items
            .filter(item => normalize(item.parent_id || item.parentId) === targetPid)
            .sort((a, b) => (a.orderBy || 0) - (b.orderBy || 0))
            .map(item => ({
                ...item,
                children: item.children || buildTree(items, item.id)
            }));
    }

    return buildTree(data, parentId);
}
