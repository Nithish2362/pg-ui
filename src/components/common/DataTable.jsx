import React from 'react';
import { Table, Loader, Text, TextInput, Group, Pagination } from '@mantine/core';
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
 */
const DataTable = ({ 
  columns, 
  data, 
  loading, 
  search, 
  onSearch, 
  title, 
  totalCount, 
  page, 
  totalPages, 
  onPageChange 
}) => {
  return (
    <div className="data-card">
      <div className="data-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>{title} {totalCount !== undefined ? `(${totalCount})` : data.length > 0 ? `(${data.length})` : ''}</h3>
        {onSearch && (
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: '320px' }}
          />
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <Table verticalSpacing="md" horizontalSpacing="xl">
          <Table.Thead>
            <Table.Tr>
              {columns.map((col, i) => (
                <Table.Th key={i} style={{ textAlign: 'center' }}>{col.header}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length} style={{ textAlign: 'center', padding: '60px' }}>
                  <Loader size="sm" />
                </Table.Td>
              </Table.Tr>
            ) : data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  No records found
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((row, rowIndex) => (
                <Table.Tr key={row.id || rowIndex}>
                  {columns.map((col, colIndex) => (
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

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination 
            total={totalPages} 
            value={page} 
            onChange={onPageChange} 
            size="sm"
            radius="xl"
            withEdges
            color="#3f92c5"
          />
        </Group>
      )}
    </div>
  );
};

export default DataTable;
