import { AppShell, Avatar, Button, Group, Tabs, Text, Burger, Drawer, Stack, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout, IconHome, IconBuildingCommunity } from '@tabler/icons-react';
import { createContext, Suspense, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ModuleJson from '../moduleData/ModuleJson';
import '../css/Header.css';

export const ActiveTabContext = createContext();

export default function Layout() {
  const user = JSON.parse(localStorage.getItem('user') || "{}");
  console.log(user, "nknk");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  // Get dynamic modules based on role
  const headerData = useMemo(() => ModuleJson(), []);

  // Determine which top-level item is active
  const activeHeader = useMemo(() => {
    const currentModule = headerData.find(m => m.path === pathname || pathname.startsWith(m.path + '/'));
    if (!currentModule) return headerData.find(h => h.parent_id === null) || null;

    if (currentModule.parent_id === null) return currentModule;

    // If it's a child, find its parent
    return headerData.find(m => m.id === currentModule.parent_id) || currentModule;
  }, [headerData, pathname]);

  // Children for current active header (Residents -> Tenants, Payments)
  const childTabs = useMemo(() => {
    // If ModuleJson doesn't have children array, we find modules where parent_id matches activeHeader.id
    return headerData.filter(m => m.parent_id === activeHeader?.id);
  }, [activeHeader, headerData]);

  const activeTab = useMemo(() => {
    const exact = childTabs.find(t => t.path === pathname);
    if (exact) return exact;
    return childTabs.find(t => t.path !== '/' && pathname.startsWith(t.path)) || childTabs[0] || null;
  }, [childTabs, pathname]);

  const handleHeaderClick = useCallback((header) => {
    const children = headerData.filter(m => m.parent_id === header.id);
    if (children.length > 0) {
      const defaultChild = children.find(c => c.id === header.defaultChildId) || children[0];
      navigate(defaultChild.path);
    } else {
      navigate(header.path);
    }
    closeDrawer();
  }, [navigate, headerData, closeDrawer]);

  const handleTabClick = useCallback((tabId) => {
    const tab = childTabs.find(t => String(t.id) === String(tabId));
    if (tab) navigate(tab.path);
  }, [navigate, childTabs]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const contextValue = { user, activeHeader, activeTab, childTabs };

  // Only top level items for the header
  const topLevelNav = headerData.filter(m => m.parent_id === null);

  return (
    <ActiveTabContext.Provider value={contextValue}>
      <AppShell header={{ height: 50 }} padding={{ base: 'xs', sm: 'md' }}>
        <AppShell.Header className="nav-header-shell" style={{ zIndex: 1001 }}>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="md" size="sm" color="#022d46" />

              <Group gap={6} wrap="nowrap" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3f92c5 0%, #296b92 100%)',
                  borderRadius: '6px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconBuildingCommunity size={16} color="white" />
                </div>
                <Text
                  fw={900}
                  size="md"
                  style={{
                    color: '#022d46',
                    letterSpacing: '-0.5px',
                    display: 'block'
                  }}
                >
                  STAYWOW
                </Text>
              </Group>

              <Group visibleFrom="md" gap="xs" style={{ height: '100%' }}>
                {topLevelNav.map((headernav) => (
                  <div
                    key={headernav.id}
                    className={`nav-item ${activeHeader?.id === headernav.id ? 'nav-item-active' : ''}`}
                    onClick={() => handleHeaderClick(headernav)}
                  >
                    <span>{headernav.name}</span>
                    <span className={`active-indicator ${activeHeader?.id === headernav.id ? 'visible' : ''}`}></span>
                  </div>
                ))}
              </Group>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', gap: '0px' }}>
                <Text size="xs" fw={700} c="blue" style={{ lineHeight: 1 }}>{user?.role}</Text>
                <Text size="xs" fw={500} c="dimmed" style={{ lineHeight: 1 }}>Hii,{user?.name}</Text>
              </div>
              <Avatar size="sm" color="blue" radius="xl">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0)}
              </Avatar>
              <ActionIcon variant="subtle" color="gray.7" onClick={handleLogout} size="sm" hiddenFrom="sm">
                <IconLogout size={16} />
              </ActionIcon>
              <Button variant="subtle" color="gray.7" onClick={handleLogout} size="compact-sm" rightSection={<IconLogout size={16} />} visibleFrom="sm">
                Logout
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <div style={{ marginTop: '10px' }}>
            {childTabs.length > 0 && (
              <Tabs
                value={activeTab ? String(activeTab.id) : null}
                onChange={handleTabClick}
                mb="xl"
                variant="default"
              >
                <Tabs.List style={{ flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', paddingBottom: '2px' }}>
                  {childTabs.map(tab => (
                    <Tabs.Tab key={tab.id} value={String(tab.id)} style={{ flexShrink: 0 }}>{tab.name}</Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
            )}

            <Suspense >
              <Outlet />
            </Suspense>
          </div>
        </AppShell.Main>

        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="sm"
          title={<Text fw={700} size="lg">Menu</Text>}
          hiddenFrom="md"
          zIndex={1000000}
        >
          <Stack gap="sm">
            {topLevelNav.map((headernav) => (
              <Button
                key={headernav.id}
                variant={activeHeader?.id === headernav.id ? 'light' : 'subtle'}
                color={activeHeader?.id === headernav.id ? 'blue' : 'gray'}
                onClick={() => handleHeaderClick(headernav)}
                fullWidth
                justify="flex-start"
                size="md"
              >
                {headernav.name}
              </Button>
            ))}
          </Stack>
        </Drawer>
      </AppShell>
    </ActiveTabContext.Provider>
  );
}
