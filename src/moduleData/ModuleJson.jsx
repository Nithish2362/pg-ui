import _ from "lodash";

export function ModuleJson(parentId) {
    const user = JSON.parse(localStorage.getItem("user"));
    const data = Array.isArray(user?.views) ? user.views : [];

    const normalizeParent = (value) => {
        if (value === undefined || value === null || value === "") {
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
