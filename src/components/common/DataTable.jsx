import React, { useState, useEffect, useRef } from 'react';
import { Table, Loader, Text, TextInput, Group, Pagination, Select, Card, Stack, Divider, SimpleGrid, Center } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

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
    // Reset if search changed OR if we are back to page 1
    if (search !== prevSearchRef.current || page === 1) {
      setAccumulatedData(safeData);
      prevSearchRef.current = search;
    } else if (onPageChange) {
      // Append only if it's a subsequent page
      setAccumulatedData(prev => {
        const existingIds = new Set(prev.map(p => p.id || p.paymentId || p.tenantId || p.staffId || p.roomId || p.visitorId || JSON.stringify(p)));
        const newData = safeData.filter(d => !existingIds.has(d.id || d.paymentId || d.tenantId || d.staffId || d.roomId || d.visitorId || JSON.stringify(d)));
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
    <div style={{ width: '100%', animation: 'fadeIn 0.5s ease' }}>
      {onSearch && (
        <Group justify="flex-start" mb="xl" wrap="wrap">
          <TextInput
            placeholder="Search"
            rightSection={<IconSearch size={18} color="var(--accent-gold)" />}
            value={search}
            onChange={(e) => {
              onSearch(e.target.value);
              if (onPageChange && page !== 1) onPageChange(1);
            }}
            radius="md"
          />
        </Group>
      )}

      <div style={{ maxHeight: '72vh', overflowY: 'auto', padding: '10px 5px' }} onScroll={handleScroll}>
        {accumulatedData.length === 0 && !loading ? (
          <Center py="100px" style={{ flexDirection: 'column', opacity: 0.5 }}>
            <IconSearch size={48} stroke={1} />
            <Text ta="center" mt="md" fw={600}>No entries found in registry</Text>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
            {accumulatedData.map((row, rowIndex) => (
              <Card
                key={row.id || rowIndex}
                radius="24px"
                withBorder
                p="xl"
                style={{
                  background: '#ffffff',
                  borderColor: 'rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  transition: 'all 0.3s ease'
                }}
                className="data-row-card"
              >
                <Stack gap="sm" style={{ flexGrow: 1 }}>
                  {safeColumns.map((col, colIndex) => (
                    <React.Fragment key={colIndex}>
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" style={{ flexShrink: 0, maxWidth: '40%', letterSpacing: '0.05em' }}>
                          {col.header}
                        </Text>
                        <div style={{
                          textAlign: 'right',
                          flexGrow: 1,
                          wordBreak: 'break-word',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center'
                        }}>
                          {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                        </div>
                      </Group>
                      {colIndex < safeColumns.length - 1 && <Divider color="rgba(0,0,0,0.03)" />}
                    </React.Fragment>
                  ))}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '0 10px', flexWrap: 'wrap', gap: '10px' }}>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          {accumulatedData.length > 0 ? (
            <>Displaying <b style={{ color: 'var(--accent-gold)' }}>{accumulatedData.length}</b> of <b style={{ color: 'var(--primary)' }}>{totalCount || accumulatedData.length}</b> total records</>
          ) : (
            'Registry empty'
          )}
        </Text>

        {loading && (
          <Center>
            <Loader size="xs" color="brand" />
            <Text ml="sm" size="xs" fw={700} c="dimmed">FETCHING MORE DATA...</Text>
          </Center>
        )}
      </div>
    </div>
  );
};

export default DataTable;
