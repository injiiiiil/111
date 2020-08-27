import _ from 'lodash'
import React, { FC } from 'react'
import { connect } from 'react-redux'

import style from './style.scss'
import ConfigStatus from './ConfigStatus'
import LangSwitcher from './LangSwitcher'
import { TrainingStatusComponent } from './TrainingStatus'

interface Props {
  langSwitcherOpen: boolean
  user: any
  contentLang: string
  toggleLangSwitcher: (e: any) => void
}

const StatusBar: FC<Props> = props => {
  return (
    <footer className={style.statusBar}>
      <div className={style.item}>
        <span>{window.APP_VERSION}</span>
        <span className={style.botName}>{window.BOT_NAME}</span>
        {!window.USE_ONEFLOW && (
          <LangSwitcher toggleLangSwitcher={props.toggleLangSwitcher} langSwitcherOpen={props.langSwitcherOpen} />
        )}
      </div>
      <div className={style.item}>
        <TrainingStatusComponent currentLanguage={props.contentLang} />
        {props.user && props.user.isSuperAdmin && <ConfigStatus />}
      </div>
    </footer>
  )
}

const mapStateToProps = state => ({
  user: state.user,
  contentLang: state.language.contentLang
})

export default connect(mapStateToProps)(StatusBar)
