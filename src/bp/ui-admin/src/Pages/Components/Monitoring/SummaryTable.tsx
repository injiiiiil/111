import { Button, Tooltip } from '@blueprintjs/core'
import { Metric } from 'common/monitoring'
import moment from 'moment'
import React, { useState } from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import ServerControl from './ServerControl'

const SummaryTable = ({ data }) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const [host, setHost] = useState('')

  const restartServer = async host => {
    setHost(host)
    setModalOpen(true)
  }

  const columns = [
    {
      Header: 'Host',
      accessor: 'host'
    },
    {
      Header: 'Uptime',
      Cell: x => {
        const minutes = moment.duration(x.value, 'seconds').asMinutes()
        return `${Math.round(minutes)} mins`
      },
      width: 120,
      className: 'center',
      accessor: 'uptime'
    },
    {
      Header: 'Peak CPU Usage',
      Cell: x => x.value + '%',
      width: 120,
      accessor: 'cpu.usage'
    },
    {
      Header: 'Peak Mem Usage',
      Cell: x => x.value + '%',
      width: 120,
      accessor: 'mem.usage'
    },
    {
      Header: 'Requests',
      width: 120,
      className: 'center',
      accessor: Metric.Requests
    },
    {
      Header: 'Events In',
      width: 120,
      className: 'center',
      accessor: Metric.EventsIn,
      align: 'right'
    },
    {
      Header: 'Events Out',
      width: 120,
      className: 'center',
      accessor: Metric.EventsOut
    },
    {
      Header: 'Warnings',
      width: 120,
      className: 'center',
      accessor: Metric.Warnings
    },
    {
      Header: 'Errors',
      width: 120,
      className: 'center',
      accessor: Metric.Errors
    },
    {
      Header: 'Criticals',
      width: 120,
      className: 'center',
      accessor: Metric.Criticals
    },
    {
      Cell: x => (
        <Tooltip content="Restart server">
          <Button icon="power" onClick={() => restartServer(x.original.host)} small />
        </Tooltip>
      ),

      filterable: false,
      width: 45
    }
  ]

  return (
    <React.Fragment>
      <ReactTable
        columns={columns}
        data={data}
        defaultPageSize={5}
        defaultSorted={[{ id: 'host', desc: false }]}
        className="-striped -highlight monitoringOverview"
      />
      <ServerControl hostname={host} isOpen={isModalOpen} toggle={() => setModalOpen(!isModalOpen)} />
    </React.Fragment>
  )
}

export default SummaryTable
