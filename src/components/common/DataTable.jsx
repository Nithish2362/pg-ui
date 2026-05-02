import React from 'react';
import { Table, Loader, Text, TextInput, Group, Pagination, Select } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

/**
 * Common DataTable Component
 * @param {Array} columns - [{ header: 'Name', key: 'name', render: (val, row) => ... }]
 * @param {Array} data - Data to display
 * @param {boolean} loading - Loading state
 * @param {string} search - Search value
 * @param {function} onSearch - Search change handler
 * @param {number} totalCount - Total number of records (optional)
 * @param {number} page - Current page (optional)
 * @param {number} totalPages - Total pages (optional)
 * @param {function} onPageChange - Page change handler (optional)
 * @param {number} pageSize - Rows per page (optional)
 * @param {function} onPageSizeChange - Rows per page change handler (optional)
 */
const DataTable = ({ 
  columns = [], 
  data = [], 
  loading, 
  search, 
  onSearch, 
  title, 
  totalCount, 
  page = 1, 
  totalPages = 0, 
  onPageChange,
  pageSize = 10,
  onPageSizeChange
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount || safeData.length);

  return (
    <div className="data-card">
      <div className="data-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>{title} {totalCount !== undefined ? `(${totalCount})` : safeData.length > 0 ? `(${safeData.length})` : ''}</h3>
        
        <Group>
          {onSearch && (
            <TextInput
              placeholder="Search..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              style={{ width: '280px' }}
            />
          )}
          {onPageSizeChange && (
            <Select
              size="xs"
              data={['5', '10', '20', '50']}
              value={pageSize.toString()}
              onChange={(val) => onPageSizeChange(parseInt(val))}
              style={{ width: '70px' }}
            />
          )}
        </Group>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <Table verticalSpacing="md" horizontalSpacing="xl">
          <Table.Thead>
            <Table.Tr>
              {safeColumns.map((col, i) => (
                <Table.Th key={i} style={{ textAlign: 'center' }}>{col.header}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={safeColumns.length} style={{ textAlign: 'center', padding: '60px' }}>
                  <Loader size="sm" />
                </Table.Td>
              </Table.Tr>
            ) : safeData.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={safeColumns.length} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  No records found
                </Table.Td>
              </Table.Tr>
            ) : (
              safeData.map((row, rowIndex) => (
                <Table.Tr key={row.id || rowIndex}>
                  {safeColumns.map((col, colIndex) => (
                    <Table.Td key={colIndex} style={{ textAlign: 'center' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 10px' }}>
        <Text size="sm" c="dimmed">
          {safeData.length > 0 ? (
            <>Showing <b>{start}</b> to <b>{end}</b> of <b>{totalCount || safeData.length}</b> entries</>
          ) : (
            'Showing 0 entries'
          )}
        </Text>

        {totalPages > 0 && (
          <Pagination 
            total={totalPages} 
            value={page} 
            onChange={onPageChange} 
            size="sm"
            radius="xl"
            withEdges
            color="#3f92c5"
          />
        )}
      </div>
    </div>
  );
};

export default DataTable;
