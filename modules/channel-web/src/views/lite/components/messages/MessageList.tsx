import { ResizeObserver } from '@juggle/resize-observer'
import sdk from 'botpress/sdk'
import classnames from 'classnames'
import differenceInMinutes from 'date-fns/difference_in_minutes'
import debounce from 'lodash/debounce'
import last from 'lodash/last'
import { observe } from 'mobx'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'

import constants from '../../core/constants'
import { RootStore, StoreDef } from '../../store'
import { Message as MessageType } from '../../typings'
import { isIE } from '../../utils'
import Avatar from '../common/Avatar'

import Message from './Message'
import MessageGroup, { getSuggestionPayload } from './MessageGroup'

interface State {
  manualScroll: boolean
  showNewMessageIndicator: boolean
}

class MessageList extends React.Component<MessageListProps, State> {
  private messagesDiv: HTMLElement
  private divSizeObserver: ResizeObserver
  state: State = { showNewMessageIndicator: false, manualScroll: false }

  componentDidMount() {
    this.tryScrollToBottom(true)

    observe(this.props.focusedArea, focus => {
      focus.newValue === 'convo' && this.messagesDiv.focus()
    })

    observe(this.props.currentMessages, messages => {
      if (this.state.manualScroll) {
        if (!this.state.showNewMessageIndicator) {
          this.setState({ showNewMessageIndicator: true })
        }
        return
      }
      this.tryScrollToBottom(true)
    })

    // this should account for keyboard rendering as it triggers a resize of the messagesDiv
    this.divSizeObserver = new ResizeObserver(
      debounce(
        ([divResizeEntry]) => {
          // we don't need to do anything with the resize entry
          this.tryScrollToBottom()
        },
        200,
        { trailing: true }
      )
    )
    this.divSizeObserver.observe(this.messagesDiv)
  }

  componentWillUnmount() {
    this.divSizeObserver.disconnect()
  }

  tryScrollToBottom(delayed?: boolean) {
    setTimeout(
      () => {
        try {
          this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
        } catch (err) {
          // Discard the error
        }
      },
      delayed ? 250 : 0
    )
  }

  handleKeyDown = e => {
    if (!this.props.enableArrowNavigation) {
      return
    }

    const maxScroll = this.messagesDiv.scrollHeight - this.messagesDiv.clientHeight
    const shouldFocusNext = e.key == 'ArrowRight' || (e.key == 'ArrowDown' && this.messagesDiv.scrollTop == maxScroll)
    const shouldFocusPrevious = e.key == 'ArrowLeft' || (e.key == 'ArrowUp' && this.messagesDiv.scrollTop == 0)

    if (shouldFocusNext) {
      this.messagesDiv.blur()
      this.props.focusNext()
    }

    if (shouldFocusPrevious) {
      this.messagesDiv.blur()
      this.props.focusPrevious()
    }
  }

  renderDate(date) {
    return (
      <div className={'bpw-date-container'}>
        {this.props.intl.formatTime(new Date(date), {
          hour12: false,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })}
      </div>
    )
  }

  renderAvatar(name, url) {
    const size = isIE ? 40 : 16

    return <Avatar name={name} avatarUrl={url} height={size} width={size} isEmulator={this.props.isEmulator} />
  }

  renderMessageGroups() {
    const messages = (this.props.currentMessages || []).filter(m => this.shouldDisplayMessage(m))
    const groups = []

    let lastSpeaker = undefined
    let lastDate = undefined
    let currentGroup = undefined

    const lastMessage = last(messages.filter(x => !x.userId))
    const suggestions: sdk.IO.SuggestChoice[] = lastMessage?.payload.metadata?.__suggestions || []
    const staticMenuSuggest = suggestions.filter(x => x.position === 'static')

    messages.forEach(m => {
      const speaker = m.full_name
      const date = m.sent_on

      // Create a new group if messages are separated by more than X minutes or if different speaker
      if (
        speaker !== lastSpeaker ||
        differenceInMinutes(new Date(date), new Date(lastDate)) >= constants.TIME_BETWEEN_DATES
      ) {
        currentGroup = []
        groups.push(currentGroup)
      }

      if (currentGroup.find(x => x.id === m.id)) {
        return
      }
      currentGroup.push(m)

      lastSpeaker = speaker
      lastDate = date
    })

    if (this.props.isBotTyping.get()) {
      if (lastSpeaker !== 'bot') {
        currentGroup = []
        groups.push(currentGroup)
      }

      currentGroup.push({
        sent_on: new Date(),
        userId: undefined,
        message_type: 'typing'
      })
    }
    return (
      <div>
        {groups.map((group, i) => {
          const lastGroup = groups[i - 1]
          const lastDate = lastGroup?.[lastGroup.length - 1]?.sent_on
          const groupDate = group?.[0].sent_on

          const isDateNeeded =
            !groups[i - 1] ||
            differenceInMinutes(new Date(groupDate), new Date(lastDate)) > constants.TIME_BETWEEN_DATES

          const [{ userId, full_name: userName, avatar_url: avatarUrl }] = group

          const avatar = userId
            ? this.props.showUserAvatar && this.renderAvatar(userName, avatarUrl)
            : this.renderAvatar(this.props.botName, avatarUrl || this.props.botAvatarUrl)

          return (
            <div key={i}>
              {isDateNeeded && this.renderDate(group[0].sent_on)}
              <MessageGroup
                isBot={!userId}
                avatar={avatar}
                userName={userName}
                key={`msg-group-${i}`}
                isLastGroup={i >= groups.length - 1}
                messages={group}
                suggestions={suggestions}
              />
            </div>
          )
        })}

        {!!staticMenuSuggest.length && (
          <div className={classnames('bpw-message-big-container', { 'bpw-from-user': false })}>
            <div role="region" className={'bpw-message-container'}>
              <div aria-live="assertive" role="log" className={'bpw-message-group'}>
                <Message
                  store={this.props.store}
                  onSendData={this.props.onSendData}
                  key={`msg-static-suggest`}
                  payload={getSuggestionPayload(staticMenuSuggest, {})}
                  noBubble
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  shouldDisplayMessage = (m: MessageType): boolean => {
    return m.message_type !== 'postback'
  }

  handleScroll = debounce(e => {
    const scroll = this.messagesDiv.scrollHeight - this.messagesDiv.scrollTop - this.messagesDiv.clientHeight
    const manualScroll = scroll >= 150
    const showNewMessageIndicator = this.state.showNewMessageIndicator && manualScroll

    this.setState({ manualScroll, showNewMessageIndicator })
  }, 50)

  render() {
    return (
      <div
        tabIndex={0}
        onKeyDown={this.handleKeyDown}
        className={'bpw-msg-list'}
        ref={m => {
          this.messagesDiv = m
        }}
        onScroll={this.handleScroll}
      >
        {this.state.showNewMessageIndicator && (
          <div className="bpw-new-messages-indicator" onClick={e => this.tryScrollToBottom()}>
            <span>
              {this.props.intl.formatMessage({
                id: 'messages.newMessage' + (this.props.currentMessages.length === 1 ? '' : 's')
              })}
            </span>
          </div>
        )}
        {this.renderMessageGroups()}
      </div>
    )
  }
}

export default inject(({ store }: { store: RootStore }) => ({
  store,
  intl: store.intl,
  botName: store.botName,
  isBotTyping: store.isBotTyping,
  isEmulator: store.isEmulator,
  botAvatarUrl: store.botAvatarUrl,
  onSendData: store.sendData,
  currentMessages: store.currentMessages,
  focusPrevious: store.view.focusPrevious,
  focusNext: store.view.focusNext,
  focusedArea: store.view.focusedArea,
  showUserAvatar: store.config.showUserAvatar,
  enableArrowNavigation: store.config.enableArrowNavigation
}))(injectIntl(observer(MessageList)))

type MessageListProps = { store?: RootStore; onSendData?: any } & InjectedIntlProps &
  Pick<
    StoreDef,
    | 'intl'
    | 'isEmulator'
    | 'isBotTyping'
    | 'focusedArea'
    | 'focusPrevious'
    | 'focusNext'
    | 'botAvatarUrl'
    | 'botName'
    | 'enableArrowNavigation'
    | 'showUserAvatar'
    | 'currentMessages'
  >
