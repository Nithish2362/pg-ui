import { AppShell, Avatar, Button, Container, Group, Tabs } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { createContext, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ModuleJson } from '../moduleData/ModuleJson';
import '../css/Header.css';

export const ActiveTabContext = createContext();

export default function Layout() {
  const [stateData, setStateData] = useState({
    parentId: null,
    activeIndex: 0,
    childTabs: [],
    childParentId: null,
    buttonGroup: []
  });
  const [user] = useState(JSON.parse(localStorage.getItem('user')));

  const navigate = useNavigate();
  const { state, pathname } = useLocation();
  
  const headerData = useMemo(() => ModuleJson(null), []);
  useEffect(() => {
    if (state) {
      setStateData((prevState) => ({
        ...prevState,
        parentId: state.parentId,
        activeIndex: state.activeIndex,
        childTabs: state.tabs,
        childParentId: state.childParentId,
        buttonGroup: state.childParentId ? ModuleJson(state.childParentId) : [],
      }));
      return;
    }

    if (headerData.length > 0) {
      const firstHeader = headerData[0];
      const childParentId = firstHeader.defaultChildId || null;
      setStateData((prevState) => ({
        ...prevState,
        parentId: firstHeader.id,
        activeIndex: 0,
        childTabs: firstHeader.children || [],
        childParentId,
        buttonGroup: childParentId ? ModuleJson(childParentId) : [],
      }));
    }
  }, [state, headerData]);

  const handleLinkClick = useCallback((index, tab) => {
    navigate(tab.path, { state: { parentId: tab.id, tabs: tab.children, childParentId: tab.defaultChildId, activeIndex: index } });
  }, [navigate]);

  const handleTabClick = useCallback((tabId) => {
    const tab = stateData.childTabs.find(t => String(t.id) === String(tabId));
    if(tab) {
        navigate(tab.path, { state: { parentId: stateData.parentId, tabs: stateData.childTabs, buttonGroup: tab.children, childParentId: tab.id, activeIndex: stateData.activeIndex } });
    }
  }, [navigate, stateData]);

  const handleButtonClick = useCallback((tab) => {
    const parentId = tab.parent_id ?? tab.parentId;
    navigate(tab.path, { state: { parentId: stateData.parentId, tabs: stateData.childTabs, buttonGroup: stateData.buttonGroup, childParentId: parentId, activeIndex: stateData.activeIndex } });
  }, [navigate, stateData]);

  const checkCurrentPathMatch = (button) => {
    return button.path === pathname;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const contextValue = { stateData, setStateData, user };

  return (
    <ActiveTabContext.Provider value={contextValue}>
      <AppShell header={{ height: 60 }} padding="md">
        <AppShell.Header className="nav-header-shell">
          <nav className='nav-bar'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="logo-text">PG MANAGER</div>
              {headerData.map((headernav, index) => (
                <div key={headernav.id} className="nav-item" onClick={() => handleLinkClick(index, headernav)}>
                  <span style={{ fontWeight: index === stateData.activeIndex ? '900' : '500' }}>{headernav.name}</span>
                  <span className={`active-indicator ${index === stateData.activeIndex ? 'visible' : ''}`}></span>
                </div>
              ))}
            </div>
            <div className="user-section">
              <Group gap="xs">
                <div className="user-info">
                  <span>Hi, {user?.username}</span>
                  <Avatar size="sm" color="blue" radius="xl">{user?.username?.charAt(0).toUpperCase()}</Avatar>
                </div>
                <Button variant="subtle" color="gray" size="xs" onClick={handleLogout} leftSection={<IconLogout size={14} />}>
                  Logout
                </Button>
              </Group>
            </div>
          </nav>
        </AppShell.Header>

        <AppShell.Main>
          {stateData.childTabs?.length > 0 && (
            <Tabs value={stateData.childParentId ? String(stateData.childParentId) : null} onChange={handleTabClick} variant="pills" mb="md">
              <Tabs.List>
                {stateData.childTabs.map(tab => (
                  <Tabs.Tab key={tab.id} value={String(tab.id)}>{tab.name}</Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          )}

          {stateData.buttonGroup?.length > 0 && (
            <Group mb="md">
              {stateData.buttonGroup.map((button) => (
                <Button
                  key={button.id}
                  variant={checkCurrentPathMatch(button) ? 'filled' : 'default'}
                  color={checkCurrentPathMatch(button) ? 'blue' : 'gray'}
                  onClick={() => handleButtonClick(button)}
                  radius="md"
                >
                  + {button.name}
                </Button>
              ))}
            </Group>
          )}

          <Container size="xl">
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
          </Container>
        </AppShell.Main>
      </AppShell>
    </ActiveTabContext.Provider>
  );
}
