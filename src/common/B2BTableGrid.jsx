import '@mantine/dates/styles.css';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import '@mantine/core/styles.css';
import 'mantine-react-table/styles.css';
import React from 'react';
import '../css/MantineTable.css'

const B2BTableGrid = ({
    data = [],
    columns = [],
    enableSorting = false,
    enableFullScreenToggle = false,
    enableColumnActions = false,
    enableGlobalFilter = true,
    enableDensityToggle = false,
    manualFiltering = false,
    manualPagination = true,
    manualSorting = false,
    enableTopToolbar = false,
    renderRowActions = () => { },
    onColumnFilterFnsChange = () => { },
    onColumnFiltersChange = () => { },
    onGlobalFilterChange = () => { },
    onPaginationChange = () => { },
    onSortingChange = () => { },
    columnFilters = [],
    columnFilterFns = () => { },
    selectAllMode = '',
    globalFilter = '',
    sorting = [],
    pagination = { pageIndex: 0, pageSize: 5 },
    enablePagination = true,
    rowsPerPageOptions = ['5', '10', '15','25','50','100'],
    isLoading = false,
    isError = false,
    isFetching = false,
    pageCount,
    rowCount,
    enableResizing = false,
    manualGrouping = false,
    defaultGrouping = [],
    enableGrouping = false,
    enableColumnPinning = false,
    left = [],
    right = [],
    searchTerm = '',
    placeholder,
    handleSearchChange = () => { },
    enableBatchRowSelection = false,
     renderDetailPanel = null, 
    enableRowSelection = false,
    onRowSelectionChange = () => { },
    rowSelection = false
}) => {
    const table = useMantineReactTable({
        data: data,
        columns: columns,
        defaultDisplayColumn: {
            enableResizing: enableResizing
        },
        paginationDisplayMode: 'pages',
        mantinePaginationProps: {
            radius: 'sm',
            size: 'sm',
            rowsPerPageOptions: rowsPerPageOptions
        },
        mantineTableProps: { striped: true },
        enableColumnActions: enableColumnActions,
        enablePagination: enablePagination,
        enableGlobalFilter: enableGlobalFilter,
        enableDensityToggle: enableDensityToggle,
        initialState: {
            showColumnFilters: false,
            density: 'xs',
            grouping: defaultGrouping,
            columnPinning: { left: left, right: right }
        },
        mantineSearchTextInputProps: {
            placeholder: placeholder,
            value: searchTerm,
            onChange: handleSearchChange,
        },
        layoutMode: 'grid',
        renderRowActions: renderRowActions,
        enableTopToolbar: enableTopToolbar,
        manualFiltering: manualFiltering,
        enableSorting: enableSorting,
        manualPagination: manualPagination,
        manualSorting: manualSorting,
        enableHiding: false,
        enableFullScreenToggle: enableFullScreenToggle,
        columnFilterDisplayMode: "subheader",
        pageCount: pageCount,
        rowCount: rowCount,
        onColumnFilterFnsChange: onColumnFilterFnsChange,
        onColumnFiltersChange: onColumnFiltersChange,
        onGlobalFilterChange: onGlobalFilterChange,
        enableExpanding: !!renderDetailPanel,
        renderDetailPanel: renderDetailPanel,
        onPaginationChange: onPaginationChange,
        onSortingChange: onSortingChange,
        selectAllMode: selectAllMode,
        positionPagination: 'bottom',
        positionToolbarAlertBanner: 'head-overlay',
        manualGrouping: manualGrouping,
        state: {
            columnFilters,
            columnFilterFns,
            globalFilter,
            isLoading,
            pagination,
            showAlertBanner: isError,
            showProgressBars: isFetching,
            sorting,
            rowSelection
        },
        enableColumnFilters: false,
        enableGrouping: enableGrouping,
        enableColumnPinning: enableColumnPinning,
        enableBatchRowSelection: enableBatchRowSelection,
        enableRowSelection: enableRowSelection,
        onRowSelectionChange: onRowSelectionChange,
    })

    return (
        <MantineReactTable table={table} />
    )
}

export default B2BTableGrid;