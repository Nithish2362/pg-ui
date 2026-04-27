import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

function SalesOrderHeader({ isExpanded, onClick, name }) {
  return (
    <button
      className="salesh2"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        fontSize: '21px',
        textAlign: 'left',
        width: '100%',
        fontWeight: 'bold',
      }}
      onClick={onClick}
    >
      {name}
      <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronUp} />
    </button>
  )
}

export default SalesOrderHeader