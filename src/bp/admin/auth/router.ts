import { AdminServices } from 'admin'
import { CustomAdminRouter } from 'admin/utils/customAdminRouter'
import { JWT_COOKIE_NAME } from 'common/auth'
import { AuthRule, ChatUserAuth, RequestWithUser, TokenUser, UserProfile } from 'common/typings'
import { BadRequestError, NotFoundError } from 'core/routers/errors'
import { assertSuperAdmin, assertWorkspace, sendSuccess, validateBodySchema } from 'core/routers/util'
import StrategyBasic from 'core/services/auth/basic'
import Joi from 'joi'
import { AppLifecycle, AppLifecycleEvents } from 'lifecycle'
import _ from 'lodash'

export class AuthRouter extends CustomAdminRouter {
  constructor(services: AdminServices) {
    super('Auth', services)

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.setupRoutes()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.setupStrategies()
  }

  async setupStrategies() {
    // Waiting until the auth service was initialized (& config updated, if it's the first time)
    await AppLifecycle.waitFor(AppLifecycleEvents.SERVICES_READY)

    const strategyTypes = (await this.authService.getAllStrategies()).map(x => x.type)

    if (process.IS_PRO_ENABLED) {
      this.authStrategies.setup(this.router, strategyTypes)
    }

    if (strategyTypes.includes('basic')) {
      const basicStrategies = new StrategyBasic(this.logger, this.router, this.authService)
      basicStrategies.setup()

      this.authService.strategyBasic = basicStrategies
    }
  }

  async setupRoutes() {
    const router = this.router

    router.get(
      '/me/profile',
      this.checkTokenHeader,
      assertWorkspace,
      this.asyncMiddleware(async (req: RequestWithUser, res) => {
        const { email, strategy, isSuperAdmin } = req.tokenUser!
        const user = await this.authService.findUser(email, strategy)
        if (!user) {
          throw new NotFoundError(`User ${email || ''} not found`)
        }
        const { firstname, lastname, picture_url } = user.attributes
        const { type } = await this.authService.getStrategy(strategy)

        const permissions = await this.getUserPermissions(req.tokenUser!, req.workspace!)

        const userProfile: UserProfile = {
          firstname,
          lastname,
          email,
          picture_url,
          strategyType: type,
          strategy,
          isSuperAdmin,
          fullName: [firstname, lastname].filter(Boolean).join(' '),
          permissions
        }

        return sendSuccess(res, 'Retrieved profile successfully', userProfile)
      })
    )

    router.post(
      '/me/profile',
      this.checkTokenHeader,
      this.asyncMiddleware(async (req: RequestWithUser, res) => {
        const { email, strategy } = req.tokenUser!

        validateBodySchema(
          req,
          Joi.object().keys({
            firstname: Joi.string()
              .min(0)
              .max(35)
              .trim()
              .allow(''),
            lastname: Joi.string()
              .min(0)
              .max(35)
              .trim()
              .allow(''),
            picture_url: Joi.string()
              .uri()
              .allow('')
          })
        )

        await this.authService.updateAttributes(email, strategy, {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          picture_url: req.body.picture_url
        })

        return sendSuccess(res, 'Updated profile successfully')
      })
    )

    router.get(
      '/me/workspaces',
      this.checkTokenHeader,
      this.asyncMiddleware(async (req: RequestWithUser, res) => {
        const { email, strategy, isSuperAdmin } = req.tokenUser!

        if (!isSuperAdmin) {
          return res.send(await this.workspaceService.getUserWorkspaces(email, strategy))
        }

        res.send(
          await Promise.map(this.workspaceService.getWorkspaces(), w => {
            return { email, strategy, workspace: w.id, role: w.adminRole, workspaceName: w.name }
          })
        )
      })
    )

    router.get(
      '/refresh',
      this.checkTokenHeader,
      this.asyncMiddleware(async (req: RequestWithUser, res) => {
        const config = await this.configProvider.getBotpressConfig()

        if (config.jwtToken && config.jwtToken.allowRefresh) {
          const newToken = await this.authService.refreshToken(req.tokenUser!)

          sendSuccess(res, 'Token refreshed successfully', {
            newToken: process.USE_JWT_COOKIES ? _.omit(newToken, 'jwt') : newToken
          })
        } else {
          const [, token] = req.headers.authorization!.split(' ')
          sendSuccess(res, 'Token not refreshed, sending back original', { newToken: token })
        }
      })
    )

    router.post(
      '/me/chatAuth',
      this.checkTokenHeader,
      this.asyncMiddleware(async (req: RequestWithUser, res) => {
        const { botId, sessionId, signature } = req.body as ChatUserAuth

        if (!botId || !sessionId || !signature) {
          throw new BadRequestError('Missing required fields')
        }

        await this.authService.authChatUser(req.body, req.tokenUser!)
        res.send(await this.workspaceService.getBotWorkspaceId(botId))
      })
    )

    router.post(
      '/logout',
      this.checkTokenHeader,
      this.asyncMiddleware(async (req: RequestWithUser, res) => {
        await this.authService.invalidateToken(req.tokenUser!)
        res.sendStatus(200)
      })
    )

    // Temporary route to obtain a token when using cookie authentication, for the bp pull/push command
    router.get(
      '/getToken',
      this.checkTokenHeader,
      this.asyncMiddleware(async (req: RequestWithUser, res) => {
        if (!process.USE_JWT_COOKIES) {
          return res.sendStatus(201)
        }

        res.send(req.cookies[JWT_COOKIE_NAME])
      })
    )
  }

  getUserPermissions = async (user: TokenUser, workspaceId: string): Promise<AuthRule[]> => {
    const { email, strategy, isSuperAdmin } = user
    const userRole = await this.workspaceService.getRoleForUser(email, strategy, workspaceId)

    if (isSuperAdmin) {
      return [{ res: '*', op: '+r+w' }]
    } else if (!userRole) {
      return [{ res: '*', op: '-r-w' }]
    } else {
      return userRole.rules
    }
  }

  sendSuccess = async (req, res) => {
    return sendSuccess(res)
  }
}
