import { Pagination } from '@mantine/core'
import React from 'react'

const B2BPagination = (props) => {
    return (
        <Pagination
            total={props.totalpage}
            onChange={props.onChange}
            value={props.value}
            radius={props.radius}
            color={props.color}
            withEdges={props.withEdges}
            withControls={props.withControls}
            siblings={props.siblings}
            boundaries={props.boundaries}
        />
    )
}

export default B2BPagination
