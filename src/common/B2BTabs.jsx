import { Tabs } from "@mantine/core";
import PropTypes from 'prop-types';
import React from "react";
import styled from "@emotion/styled";

const StyledTab = styled(Tabs.Tab)`
  color: var(--tab-label);
  font-size: 14px;
  &:hover {
    background: #fff;
    font-weight: bold;
  },
   &[data-active] {
    font-weight: bold;
    border-bottom: 2px inset var(--tab-label);
  }
`;

const B2BTabs = ({ tabsData = [], grow, justify, onClick, variant, margin, activeId }) => {

  return (
    <Tabs color="var(--tab-label)"  key={activeId} defaultValue={activeId} onChange={(value) => onClick(tabsData.find(tab => tab.id === value))} variant={variant} style={{ marginBottom: margin, '--tabs-list-border-width': '1px'}}>
      <Tabs.List grow={grow} justify={justify}>
        {tabsData.map((tab) => (
          <StyledTab  key={tab.id} value={tab.id} disabled={tab.disabled}>
            {tab.name}
          </StyledTab>
        ))}
      </Tabs.List>
    </Tabs>
  );
};

export default B2BTabs;

B2BTabs.propTypes = {
  tabsData: PropTypes.array,
  grow: PropTypes.bool,
  justify: PropTypes.string,
  onClick: PropTypes.func
}