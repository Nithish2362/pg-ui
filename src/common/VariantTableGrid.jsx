import React, { useMemo } from 'react'
import { BASE_URL } from '../api/EndPoints';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { Checkbox } from '@mantine/core';

const VariantTableGrid = ({
    data,
    selectedPairs,
    handleSelectPair,
    searchTerm,
    isLoading,
    handleSelectAll,
    isError,
    handleSearchChange,
    onPaginationChange = () => { }, pagination, pageCount, manualPagination,
    rowCount, isFetching
}) => {
    
    const columns = useMemo(() => [
        {
            accessorKey: 'product.image',
            header: 'Product Image',
            size: 50,
            enableSorting: false,
            enableColumnDragging: false,
            Cell: ({ row }) => {
                const image = row.original.image;
                return (
                    <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--hs-color-bg-neutral-edge)', borderRadius: '5px', display: 'flex', alignItems: 'center' }}  >
                        {image && image !== 'null' ? (
                            <img src={`${BASE_URL}${image?.replace("/api", "")}`} alt="Uploaded Badge" style={{ maxWidth: '50px', maxHeight: '50px' }} />
                        ) : <span style={{ fontSize: 'smaller' }}>No image</span>}
                    </div>
                );
            }
        },
        {
            accessorKey: 'product.articleName',
            header: 'Product Name',
            size: 180,
            enableSorting: false,
            enableColumnDragging: false,
            Cell: ({ row }) => {
                return <span>{row?.original?.product?.articleName || row?.original?.name || ''}</span>;
            },
        },
        {
            accessorKey: 'createdDate',
            header: 'Created Date',
            size: 50,
            enableSorting: false,
            enableColumnDragging: false,
            Cell: ({ row }) => {
                const timestamp = row.original.createdDate;
                const formattedDate = new Date(Number(timestamp)).toLocaleDateString('en-GB');
                return <span>{formattedDate}</span>;
            },
        },
        {
            header: (
                <Checkbox
                    checked={data.length > 0 && data.every(item => selectedPairs.includes(item.pimId))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                />
            ),
            enableSorting: false,
            enableColumnDragging: false,
            mantineTableHeadCellProps: { align: 'left' },
            mantineTableBodyCellProps: { align: 'left' },
            size: 50,
            Cell: ({ row }) => {
                return (
                    <Checkbox
                        checked={selectedPairs.includes(row.original?.pimId)}
                        onChange={() => handleSelectPair(row.original)}
                    />
                )
            },
        }
    ])

    const table = useMantineReactTable({
        columns,
        data,
        enableColumnFilterModes: true,
        enableColumnOrdering: true,
        enableFacetedValues: true,
        enableGrouping: true,
        enablePinning: true,
        enableRowActions: false,
        enableRowSelection: false,
        enableColumnFilters: false,
        enableDensityToggle: false,
        initialState: { showColumnFilters: false, showGlobalFilter: true },
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        mantinePaginationProps: {
            radius: 'xl',
            size: 'lg',
        },
        mantineSearchTextInputProps: {
            placeholder: 'Search Products',
            value: searchTerm,
            onChange: handleSearchChange,
        },
        onPaginationChange: onPaginationChange,
        manualPagination: manualPagination,
        pageCount: pageCount,
        rowCount: rowCount,
        state: {
            pagination,
            isLoading,
            showAlertBanner: isError,
            showProgressBars: isFetching,
        }
    });

    return <MantineReactTable table={table} />;

}


export default VariantTableGrid
