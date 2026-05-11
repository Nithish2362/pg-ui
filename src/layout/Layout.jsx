import { AppShell, Avatar, Button, Group, Tabs, Text, Burger, Drawer, Stack, ActionIcon, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout, IconBuildingCommunity } from '@tabler/icons-react';
import { createContext, Suspense, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ModuleJson from '../moduleData/ModuleJson';
import '../css/Header.css';

export const ActiveTabContext = createContext();

export default function Layout() {
  const user = JSON.parse(localStorage.getItem('user') || "{}");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  const headerData = useMemo(() => ModuleJson(), []);

  const activeHeader = useMemo(() => {
    const currentModule = headerData.find(m => m.path === pathname || pathname.startsWith(m.path + '/'));
    if (!currentModule) return headerData.find(h => h.parent_id === null) || null;
    if (currentModule.parent_id === null) return currentModule;
    return headerData.find(m => m.id === currentModule.parent_id) || currentModule;
  }, [headerData, pathname]);

  const childTabs = useMemo(() => {
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
  const topLevelNav = headerData.filter(m => m.parent_id === null);

  return (
    <ActiveTabContext.Provider value={contextValue}>
      <AppShell header={{ height: 56 }} padding={{ base: 'sm', sm: 'lg' }}>

        {/* ── Top Navigation Header ── */}
        <AppShell.Header className="nav-header-shell" style={{ zIndex: 100 }}>
          <div className="nav-bar">

            {/* Left: Logo + Nav */}
            <Group gap="xs" wrap="nowrap" h="100%">
              <Burger
                opened={drawerOpened}
                onClick={toggleDrawer}
                hiddenFrom="md"
                size="sm"
                color="var(--ink)"
              />

              {/* Logo */}
              <Group
                gap={8}
                wrap="nowrap"
                onClick={() => navigate('/dashboard')}
                className="logo-section"
                style={{ cursor: 'pointer', height: '100%', alignItems: 'center' }}
              >
                <div style={{
                  background: 'rgba(197,160,89,0.08)',
                  borderRadius: '10px',
                  padding: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid rgba(197,160,89,0.15)',
                  transition: 'var(--t)',
                }}>
                  <IconBuildingCommunity size={20} color="var(--gold)" />
                </div>
                <Text
                  fw={900}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.1rem',
                    letterSpacing: '0.12em',
                    color: 'var(--ink)',
                    lineHeight: 1,
                  }}
                >
                  STAYWOW
                </Text>
              </Group>

              {/* Desktop Nav Items */}
              <Group visibleFrom="md" gap={0} style={{ height: '100%' }} ml="md">
                {topLevelNav.map((headernav) => (
                  <div
                    key={headernav.id}
                    className={`nav-item ${activeHeader?.id === headernav.id ? 'nav-item-active' : ''}`}
                    onClick={() => handleHeaderClick(headernav)}
                  >
                    <span>{headernav.name}</span>
                    <span className={`active-indicator ${activeHeader?.id === headernav.id ? 'visible' : ''}`} />
                  </div>
                ))}
              </Group>
            </Group>

            {/* Right: User + Logout */}
            <Group gap="sm" wrap="nowrap">
              <div className="user-badge">
                <Avatar
                  size={30}
                  radius="xl"
                  style={{
                    background: 'var(--ink)',
                    color: 'var(--gold)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                >
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'A'}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                  <Text
                    size="xs"
                    fw={800}
                    style={{
                      color: 'var(--gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '0.65rem',
                    }}
                  >
                    {user?.role}
                  </Text>
                  <Text size="xs" fw={600} c="dark" style={{ fontSize: '0.8rem', marginTop: 2 }}>
                    {user?.name || user?.username}
                  </Text>
                </div>
              </div>

              <Button
                variant="subtle"
                color="gray"
                onClick={handleLogout}
                size="compact-sm"
                rightSection={<IconLogout size={15} />}
                visibleFrom="sm"
                style={{
                  color: 'var(--muted)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  height: 32,
                }}
              >
                Logout
              </Button>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleLogout}
                size="sm"
                hiddenFrom="sm"
              >
                <IconLogout size={16} />
              </ActionIcon>
            </Group>
          </div>
        </AppShell.Header>

        {/* ── Main Content ── */}
        <AppShell.Main style={{ background: 'var(--bg)' }}>
          <div style={{ paddingTop: '6px' }}>
            {/* Sub-navigation Tabs */}
            {childTabs.length > 0 && (
              <Tabs
                value={activeTab ? String(activeTab.id) : null}
                onChange={handleTabClick}
                mb="xl"
                variant="default"
              >
                <Tabs.List style={{
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  whiteSpace: 'nowrap',
                  scrollbarWidth: 'none',
                }}>
                  {childTabs.map(tab => (
                    <Tabs.Tab key={tab.id} value={String(tab.id)} style={{ flexShrink: 0 }}>
                      {tab.name}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
            )}

            <Suspense>
              <Outlet />
            </Suspense>
          </div>
        </AppShell.Main>

        {/* ── Mobile Drawer ── */}
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="280px"
          title={
            <Group gap={8}>
              <div style={{
                background: 'var(--ink)',
                borderRadius: 8,
                padding: 6,
                display: 'flex',
              }}>
                <IconBuildingCommunity size={18} color="var(--gold)" />
              </div>
              <Text fw={900} style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}>
                STAYWOW
              </Text>
            </Group>
          }
          hiddenFrom="md"
          zIndex={10000}
          styles={{
            content: { background: 'var(--white)' },
            header: {
              borderBottom: '1px solid var(--border)',
              padding: '16px 20px',
            },
            body: { padding: '16px 12px' },
          }}
        >
          <Stack gap={4}>
            {topLevelNav.map((headernav) => (
              <Button
                key={headernav.id}
                variant={activeHeader?.id === headernav.id ? 'filled' : 'subtle'}
                color={activeHeader?.id === headernav.id ? 'dark' : 'gray'}
                onClick={() => handleHeaderClick(headernav)}
                fullWidth
                justify="flex-start"
                size="md"
                radius="md"
                style={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {headernav.name}
              </Button>
            ))}
            <Divider my="sm" />
            <Button
              variant="subtle"
              color="red"
              onClick={handleLogout}
              fullWidth
              justify="flex-start"
              size="md"
              radius="md"
              rightSection={<IconLogout size={16} />}
              style={{ fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              Sign Out
            </Button>
          </Stack>
        </Drawer>

      </AppShell>
    </ActiveTabContext.Provider>
  );
}
