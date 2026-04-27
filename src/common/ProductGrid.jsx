import { Badge, Checkbox, Text } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import _, { head, size } from 'lodash';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { useMemo, useState } from 'react';
import { BASE_URL } from '../api/EndPoints';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faFilterCircleXmark } from '@fortawesome/free-solid-svg-icons';

const ProductGrid = ({
    data,
    editVariant,
    vendorId,
    map,
    searchTerm,
    areAllSelected,
    handleSelectAllPairs,
    selectedPairs,
    handleSelectPair,
    setStatus,
    status,
    isLoading,
    published,
    setPublished,
    isError,
    handleSearchChange,
    onPaginationChange = () => { }, pagination, pageCount, manualPagination,
    rowCount, isFetching }) => {
    const { pimId } = data[0] || {};
    const [openMenubar, setOpenMenubar] = useState(false);
        const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

    const columns = useMemo(() => {
        const columnArray = [
            {
                id: 'product',
                columns: [
                    {
                        accessorKey: 'product.image',
                        header: 'Image',
                        size: 110,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => {
                            const image = row.original.image
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
                        accessorKey: 'createdDate',
                        header: 'Created Date',
                        size: 80,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => {
                            const timestamp = pimId ? row.original.product.createdDate : row.original.createdDate;
                            const formattedDate = new Date(Number(timestamp)).toLocaleDateString('en-GB'); // Format as 'DD/MM/YYYY'

                            return <span>{formattedDate}</span>;
                        },


                    },
                    {
                        accessorKey: 'articleCode',
                        header: 'Product Code',
                        size: 80,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => (
                            <span>{pimId ? row.original.product.articleCode : row.original.articleCode}</span>
                        ),
                    },
                    {
                        accessorKey: 'articleName',
                        header: 'Product Name',
                        size: 150,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => {
                            const hasVendor = !!row?.original?.vendorId || !!row?.original?.product?.vendorId;
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>
                                        {pimId ? row.original.product.articleName : row.original.articleName}
                                    </span>
                                    {hasVendor && (
                                        <Badge color="green" variant="light" size="xs">
                                            exclusive
                                        </Badge>
                                    )}
                                </div>
                            );
                        },
                    },
                    {
                        accessorKey: 'unitOfMeasures',
                        header: 'UOM',
                        size: 80,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => (
                            <span>{row.original?.otherInformation?.unitOfMeasures?.isKg ? 'KG' : row.original?.otherInformation?.unitOfMeasures?.isMeter ? 'Meter' :
                                row.original?.otherInformation?.unitOfMeasures?.isYard ? 'Yard' : 'N/A'}</span>
                        ),
                    },
                    {
                        accessorKey: 'stockTYpe',
                        header: 'Stock Type',
                        size: 80,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => (
                            <span>{row.original?.vendorReadyStock ? 'Vendor Stock' : row.original?.orderDriven ? 'Made To Order' :
                                row.original?.readyStock ? 'Ready Stock' : 'N/A'}</span>
                        ),
                    },
                    ...(vendorId ? [{
                        header: 'Vendor Product Name',
                        accessorKey: 'vendorProductName',
                        size: 100,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => row.original.vendorProductName || 'N/A'
                    }] : [

                    ]),
                    ...(vendorId ? [{
                        header: 'Vendor Product ID',
                        accessorKey: 'vendorProductId',
                        size: 100,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => row.original.vendorProductInfo?.vendorProductId || 'N/A'
                    }] : [

                    ]),
                    {
                        accessorKey: 'name',
                        header: 'Taxonomy Name',
                        size: 80,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => (
                            <span>{pimId ? row?.original?.product?.taxonomyNode?.name : row?.original?.taxonomyNode?.name}</span>
                        ),
                    },
                    {
                        accessorKey: 'brand.name',
                        header: 'Brand',
                        size: 100,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => (
                            <span>{pimId ? row?.original?.product?.brand?.name : row?.original?.brand?.name}</span>
                        ),
                    },
                    ...(vendorId ? [
                        {
                            header: 'Cost Price',
                            accessorKey: 'vendorProductInfo.costPrice',
                            size: 100,
                            Cell: ({ cell, row }) => {
                                const price = row.original?.vendorProductInfo?.costPrice;
                                return price ? price.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'INR',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }) : 'N/A';
                            },
                        }

                    ] : [{
                        accessorKey: 'priceSetting.sellingPrice',
                        header: 'Price',
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ cell, row }) => {
                            const price = pimId ? row.original.product.priceSetting.sellingPrice : row.original.priceSetting?.sellingPrice;
                            return price ? price.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'INR',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) : 'N/A';
                        },
                        size: 120
                    }]),
                      {
                        accessorKey: 'status',
                        header: (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                        <div>Status</div>
                        <FontAwesomeIcon icon={openStatusDropdown ? faFilterCircleXmark : faFilter}
                         onClick={() => setOpenStatusDropdown(prev => !prev)}style={{marginLeft: '.5rem',cursor: 'pointer'}}/>
                        {openStatusDropdown && (<div className='status-dropdown'>
                        <div onClick={() => handleStatusFilterChange('ACTIVE')} className='select-status'>
                        <Text size="xs" fw={800}>ACTIVE</Text></div>
                        <div onClick={() => handleStatusFilterChange('INACTIVE')} className='select-status'>
                        <Text size="xs" fw={800}>INACTIVE</Text></div></div>
                        )}</div>
                        ),
                        size: 100,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ row }) => {
                        const status = row.original.status;
                        return (<span style={{ color: status === 'ACTIVE' ? 'green' : 'red' }}>{status}</span>);
                        },
                    },
                    {
                        accessorKey: 'syncStatus',
                        header: 'Sync Status',
                        size: 100,
                        enableSorting: false,
                        enableColumnDragging: false,
                        Cell: ({ cell, row }) => {
                            const status = pimId ? row.original.syncStatus : row.original.syncStatus;
                            return (
                                <span style={{ color: status === true ? 'green' : 'red' }}>
                                    {status === true ? 'Synced' : 'Not Synced'}
                                </span>
                            );
                        },
                    }
                ],
            },
        ];
        // Conditionally add the 'Publish' column when pimId is present, and insert it before the last column (Actions)
        if ((pimId && !map) || published) {
            columnArray[0].columns.splice(columnArray[0].columns.length - 1, 0, {
                header: (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                        <div onClick={() => setOpenMenubar(prev => !prev)}>Published</div>
                        <FontAwesomeIcon icon={openMenubar ? faFilterCircleXmark : faFilter} onClick={() => setOpenMenubar(!openMenubar)} style={{ marginLeft: '.5rem', cursor: 'pointer' }} />
                        {openMenubar && <div className='status-dropdown'>
                            <div onClick={() => handleStatusChange(true)} className='select-status'>
                                <Text size="xs" fw={800}>Published</Text>
                            </div>
                            <div onClick={() => handleStatusChange(false)} className='select-status'>
                                <Text size="xs" fw={800}>Un Published</Text>
                            </div>
                            <div onClick={() => handleStatusChange(null)} className='select-status'>
                                <Text size="xs" fw={800}>All</Text>
                            </div>
                        </div>
                        }
                    </div>
                ),
                accessorKey: 'isPublished',
                size: 80,
                enableSorting: false,
                enableColumnDragging: false,
                Cell: ({ cell, row }) => {
                    const status = row.original.isPublished;
                    return (
                        <span style={{ color: status ? 'green' : 'red' }}>
                            {status ? "Published" : "Not Published"}
                        </span>
                    );
                },
            });
        }
        columnArray[0].columns.push({
            accessorKey: 'actions',
            header: (
                map ? (
                    <Checkbox
                        checked={areAllSelected}
                        onChange={() => handleSelectAllPairs(data)}
                    />
                ) : (
                    pimId ? 'Action' : "Actions"
                )
            ),
            enableSorting: false,
            enableColumnDragging: true,
            mantineTableHeadCellProps: { align: 'left' },
            mantineTableBodyCellProps: { align: 'left' },
            size: 50,
            Cell: ({ row }) => {
                return map ? (
                    <Checkbox
                        checked={selectedPairs.includes(row.original.productId)}
                        onChange={() => handleSelectPair(row.original)}
                    />
                ) : (
                    <IconPencil
                        onClick={() => editVariant(row.original)}
                        style={{ cursor: 'pointer', color: 'teal' }}
                        stroke={2}
                    />
                );
            },
        });

        return columnArray;
    }, [pimId, map, areAllSelected, selectedPairs, data, openMenubar,openStatusDropdown]);

    const handleStatusChange = (published) => {
        setOpenMenubar(false);
        setPublished(published)
    }
      const handleStatusFilterChange = (status) => {
        setOpenStatusDropdown(false);
        setStatus(status)
    }



    const renderDetailPanel = ({ row }) => {
        const variants = pimId ? row.original.product.productVariants : row.original.productVariants;
        const productname = pimId ? row.original.product.articleName : row.original.articleName;

        const productColumns = [{
            accessorKey: 'Variant SKU',
            header: 'Variant SKU',
            Cell: ({ row }) => (

                <span>{row.original.variantSku}</span>

            )
        },
        {
            accessorKey: 'Name',
            header: 'Name',
            Cell: ({ row }) => {
                return <span>{`${productname} / ${row.original.variants.map(vari => vari.value).join(' / ')}`}</span>

            }
        },
        ]

        const [pageSize, setPageSize] = useState(5);

        return (<>
            <p>Total Variants: {_.size(variants)}</p>
            <MantineReactTable
                columns={productColumns}
                data={variants || []}
                enableTopToolbar={false}
                enableGlobalFilter={false}
                enableSorting={false}
                enableColumnActions={false}
                paginationDisplayMode='pages'
                mantinePaginationProps={{
                    rowsPerPageOptions: ['5', '10'],
                    withEdges: false,
                }}
                initialState={{
                    pagination: {
                        pageSize: pageSize,
                        pageIndex: 0,
                    },
                }}
            />
        </>
        );
    };

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
        enableColumnPinning: true,
        initialState: {
            showColumnFilters: false, showGlobalFilter: true,
            columnPinning: { left: [], right: ['actions'] }
        },
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
        renderDetailPanel,
        state: {
            pagination,
            isLoading,
            showAlertBanner: isError,
            showProgressBars: isFetching,
        }
    });

    return <MantineReactTable table={table} />;
};

export default ProductGrid;   