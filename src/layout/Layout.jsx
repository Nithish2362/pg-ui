import { AppShell, Avatar, Button, Group, Tabs } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { createContext, Suspense, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ModuleJson } from '../moduleData/ModuleJson';
import '../css/Header.css';

export const ActiveTabContext = createContext();

export default function Layout() {
  const [user] = [JSON.parse(localStorage.getItem('user'))];

  const navigate = useNavigate();
  const { pathname } = useLocation();

  // ── All top-level nav items (Dashboard, Property, Residents, Community)
  const headerData = useMemo(() => ModuleJson(null), []);

  // ── Determine which top-level item is active based on current pathname
  const activeHeader = useMemo(() => {
    // Find exact path match first (e.g. /dashboard)
    let match = headerData.find(h => h.path === pathname);
    if (match) return match;
    // Then check children for path match
    for (const header of headerData) {
      if (header.children?.some(c => c.path === pathname)) {
        return header;
      }
    }
    return headerData[0] || null;
  }, [headerData, pathname]);

  // ── Child tabs for current active header
  const childTabs = useMemo(() => activeHeader?.children || [], [activeHeader]);

  // ── Active tab: the child whose path matches current pathname
  const activeTab = useMemo(() => {
    return childTabs.find(t => t.path === pathname) || childTabs[0] || null;
  }, [childTabs, pathname]);

  // ── Navigate to header item (go to its default child or own path)
  const handleHeaderClick = useCallback((header) => {
    if (header.children?.length > 0) {
      const defaultChild = header.children.find(c => c.id === header.defaultChildId) || header.children[0];
      navigate(defaultChild.path);
    } else {
      navigate(header.path);
    }
  }, [navigate]);

  // ── Navigate to a sub-tab
  const handleTabClick = useCallback((tabId) => {
    const tab = childTabs.find(t => String(t.id) === String(tabId));
    if (tab) navigate(tab.path);
  }, [navigate, childTabs]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const contextValue = { user, activeHeader, activeTab, childTabs };

  return (
    <ActiveTabContext.Provider value={contextValue}>
      <AppShell header={{ height: 50 }} padding="md">
        <AppShell.Header className="nav-header-shell">
          <nav className='nav-bar'>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '1.5rem' }}>
              <div className="logo-text">🏠 PG ADMIN</div>
              {headerData.map((headernav) => (
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
              <Group gap="xs">
                <div className="user-info">
                  <span>Hi, {user?.username}</span>
                  <Avatar size="sm" color="blue" radius="xl">{user?.username?.charAt(0).toUpperCase()}</Avatar>
                </div>
                <Button color="gray" size="xs" onClick={handleLogout} leftSection={<IconLogout size={14} />}>
                  Logout
                </Button>
              </Group>
            </div>
          </nav>
        </AppShell.Header>

        <AppShell.Main>
          <div >
            {childTabs.length > 0 && (
              <Tabs value={activeTab ? String(activeTab.id) : null} onChange={handleTabClick} mb="md">
                <Tabs.List>
                  {childTabs.map(tab => (
                    <Tabs.Tab key={tab.id} value={String(tab.id)}>{tab.name}</Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
            )}

            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
              <Outlet />
            </Suspense>
          </div>
        </AppShell.Main>
      </AppShell>
    </ActiveTabContext.Provider>
  );
}
