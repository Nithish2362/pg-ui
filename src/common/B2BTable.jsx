import { Table } from '@mantine/core'
import React from 'react'

const B2BTable = (props) => {

    const rows = props.elements.map((element) => (
        <Table.Tr key={element.name}>
            <Table.Td>{element.position}</Table.Td>
            <Table.Td>{element.name}</Table.Td>
            <Table.Td>{element.symbol}</Table.Td>
            <Table.Td>{element.mass}</Table.Td>
        </Table.Tr>
    ));
    return (
        <Table style={{ width: '90vw',}}
            horizontalSpacing={props.horizontalSpacing}
            verticalSpacing={props.verticalSpacing}
            striped={props.striped}
            highlightOnHover={props.highlightOnHover}
            withColumnBorders={props.withColumnBorders}
            withTableBorder={props.withTableBorder}
            withRowBorders={props.withRowBorders}
        >
            <Table.Thead style={{backgroundColor:'GrayText'}}>
                <Table.Tr>
                    {props.headers.map((header) => (
                        <Table.Th style={{textAlign:"center"}} key={header.name}>{header.name}</Table.Th>
                    ))}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    )
}

export default B2BTable
