import { AppShell, Avatar, Button, Group, Tabs, Text } from '@mantine/core';
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
  }, [navigate, headerData]);

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
      <AppShell header={{ height: 50 }} padding="md">
        <AppShell.Header className="nav-header-shell">
          <nav className='nav-bar'>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '1.5rem' }}>
              <div className="logo-text" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3f92c5 0%, #296b92 100%)',
                  borderRadius: '10px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(63, 146, 197, 0.3)'
                }}>
                  <IconBuildingCommunity size={22} color="white" />
                </div>
                <span style={{
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(to right, #3f92c5, #13415a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  STAYWOW
                </span>
              </div>
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
            </div>
            <div className="user-section">
              <Group gap="sm">
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', gap: '2px' }}>
                  <Text size="xs" fw={900} c="blue" style={{ lineHeight: 1 }}>{user?.role}</Text>
                  <Text size="sm" fw={500} c="dimmed" style={{ lineHeight: 1 }}>
                    Hi , {user?.fullName || user?.username}
                  </Text>
                </div>
                <Avatar size="md" color="blue">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0)}
                </Avatar>
                <Button color="gray" variant="subtle" size="xs" onClick={handleLogout} leftSection={<IconLogout size={16} />}>
                  Logout
                </Button>
              </Group>
            </div>
          </nav>
        </AppShell.Header>

        <AppShell.Main>
          <div style={{ marginTop: '10px' }}>
            {childTabs.length > 0 && (
              <Tabs value={activeTab ? String(activeTab.id) : null} onChange={handleTabClick} mb="xl">
                <Tabs.List>
                  {childTabs.map(tab => (
                    <Tabs.Tab key={tab.id} value={String(tab.id)}>{tab.name}</Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
            )}

            <Suspense >
              <Outlet />
            </Suspense>
          </div>
        </AppShell.Main>
      </AppShell>
    </ActiveTabContext.Provider>
  );
}
