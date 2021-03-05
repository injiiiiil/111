import { AdminServices } from 'admin'
import { CustomAdminRouter } from 'admin/utils/customAdminRouter'
import _ from 'lodash'

import AlertingRouter from './alerting/router'
import DebugRouter from './debug/router'
import MonitoringRouter from './monitoring/router'

class HealthRouter extends CustomAdminRouter {
  private debugRouter: DebugRouter
  private monitoringRouter: MonitoringRouter
  private alertingRouter: AlertingRouter

  constructor(services: AdminServices) {
    super('Health', services)
    this.debugRouter = new DebugRouter(services)
    this.monitoringRouter = new MonitoringRouter(services)
    this.alertingRouter = new AlertingRouter(services)

    this.router.use('/debug', this.debugRouter.router)
    this.router.use('/monitoring', this.monitoringRouter.router)
    this.router.use('/alerting', this.alertingRouter.router)
  }
}

export default HealthRouter
