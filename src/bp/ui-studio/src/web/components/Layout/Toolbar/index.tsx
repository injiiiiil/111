import { Icon } from '@blueprintjs/core'
import { lang } from 'botpress/shared'
import classNames from 'classnames'
import React, { FC, Fragment } from 'react'
import { connect } from 'react-redux'
import { AccessControl } from '~/components/Shared/Utils'
import { keyMap } from '~/keyboardShortcuts'

import { RootReducer } from '../../../reducers'

import style from './style.scss'
import ActionItem from './ActionItem'

interface OwnProps {
  isEmulatorOpen: boolean
  hasDoc: boolean
  toggleDocs: () => void
  toggleBottomPanel: () => void
  onToggleEmulator: () => void
}

type StateProps = ReturnType<typeof mapStateToProps>

type Props = StateProps & OwnProps

const Toolbar: FC<Props> = props => {
  const { toggleDocs, hasDoc, onToggleEmulator, isEmulatorOpen, toggleBottomPanel } = props

  return (
    <header className={style.toolbar}>
      <ul className={style.list}>
        {hasDoc && (
          <Fragment>
            <ActionItem
              title={lang.tr('toolbar.readDoc')}
              shortcut={keyMap['docs-toggle']}
              description={lang.tr('toolbar.documentationAvailable')}
              onClick={toggleDocs}
            >
              <Icon color="#1a1e22" icon="help" iconSize={16} />
            </ActionItem>
            <li className={style.divider}></li>
          </Fragment>
        )}
        <AccessControl resource="bot.logs" operation="read">
          <ActionItem
            id="statusbar_logs"
            title={lang.tr('toolbar.logsPanel')}
            shortcut={keyMap['bottom-bar']}
            description={lang.tr('toolbar.toggleLogsPanel')}
            onClick={toggleBottomPanel}
          >
            <Icon color="#1a1e22" icon="console" iconSize={16} />
          </ActionItem>
        </AccessControl>
        {window.IS_BOT_MOUNTED && (
          <ActionItem
            title={lang.tr('toolbar.showEmulator')}
            id={'statusbar_emulator'}
            shortcut={keyMap['emulator-focus']}
            onClick={onToggleEmulator}
            className={classNames({ [style.active]: isEmulatorOpen })}
          >
            <Icon color="#1a1e22" icon="chat" iconSize={16} />
            <span className={style.label}>{lang.tr('toolbar.emulator')}</span>
          </ActionItem>
        )}
      </ul>
    </header>
  )
}

const mapStateToProps = (state: RootReducer) => ({
  user: state.user,
  botInfo: state.bot,
  docHints: state.ui.docHints
})

export default connect(mapStateToProps)(Toolbar)
