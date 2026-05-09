import React, { useState, useEffect, useRef } from 'react';
import { Table, Loader, Text, TextInput, Group, Pagination, Select, Card, Stack, Divider, SimpleGrid, Center } from '@mantine/core';
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

  const [accumulatedData, setAccumulatedData] = useState([]);
  const prevSearchRef = useRef(search);

  useEffect(() => {
    // If search changes, force reset regardless of page number
    if (search !== prevSearchRef.current) {
      setAccumulatedData(safeData);
      prevSearchRef.current = search;
    } else if (page === 1 || !onPageChange) {
      setAccumulatedData(safeData);
    } else {
      setAccumulatedData(prev => {
        const existingItems = new Set(prev.map(p => p.id || p.paymentId || p.tenantId || JSON.stringify(p)));
        const newData = safeData.filter(d => !existingItems.has(d.id || d.paymentId || d.tenantId || JSON.stringify(d)));
        return [...prev, ...newData];
      });
    }
  }, [safeData, page, onPageChange, search]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100;
    if (bottom && !loading && accumulatedData.length < totalCount && onPageChange) {
      onPageChange(page + 1);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {onSearch && (
        <Group justify="flex-start" mb="md" wrap="wrap">
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              onSearch(e.target.value);
              if (onPageChange && page !== 1) onPageChange(1);
            }}
            style={{ width: '280px', maxWidth: '100%' }}
            radius="md"
          />
        </Group>
      )}

      <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '5px' }} onScroll={handleScroll}>
        {accumulatedData.length === 0 && !loading ? (
          <Text ta="center" py="xl" c="dimmed">No records found</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
            {accumulatedData.map((row, rowIndex) => (
              <Card key={row.id || rowIndex} shadow="sm" radius="md" withBorder p="md" style={{ background: '#fafafa', borderColor: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <Stack gap="sm" style={{ flexGrow: 1 }}>
                  {safeColumns.map((col, colIndex) => (
                    <React.Fragment key={colIndex}>
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ flexShrink: 0, maxWidth: '40%' }}>
                          {col.header}
                        </Text>
                        <div style={{ textAlign: 'right', flexGrow: 1, wordBreak: 'break-word', fontSize: '14px', fontWeight: 600, color: '#1e293b', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                        </div>
                      </Group>
                      {colIndex < safeColumns.length - 1 && <Divider color="gray.2" />}
                    </React.Fragment>
                  ))}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 10px', flexWrap: 'wrap', gap: '10px' }}>
        <Text size="sm" c="dimmed">
          {accumulatedData.length > 0 ? (
            <>Showing <b>{accumulatedData.length}</b> of <b>{totalCount || accumulatedData.length}</b> entries</>
          ) : (
            'Showing 0 entries'
          )}
        </Text>

        {loading && (
          <Center>
            <Loader size="sm" color="blue" />
            <Text ml="sm" size="sm" c="dimmed">Loading more...</Text>
          </Center>
        )}
      </div>
    </div>
  );
};

export default DataTable;
