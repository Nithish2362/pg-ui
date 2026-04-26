import _ from "lodash";

export function ModuleJson(parentId) {
    const user = JSON.parse(localStorage.getItem("user"));
    const data = user?.views || [];
    
    function buildTree(data, parentId = null) {
        return _.chain(data)
            .filter(item => item.parentId === parentId)
            .sortBy('orderBy')
            .map(item => ({
                ...item,
                children: buildTree(data, item.id)
            }))
            .value();
    }

    return buildTree(data, parentId);
}
