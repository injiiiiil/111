import { Callout, Icon } from '@blueprintjs/core'
import { Tab, Tabs } from '@blueprintjs/core'
import { Container } from 'botpress/ui'
import _ from 'lodash'
import React, { FC, useEffect, useState } from 'react'

import { FeedbackItem, Goal, QnAItem } from '../../backend/typings'

import { makeApi } from './api'
import Conversation from './components/messages/Conversation'
import FeedbackItemPanel from './components/FeedbackItemPanel'
import style from './style.scss'

type SelectedTabId = 'pending' | 'solved'

export default props => {
  const { bp, contentLang } = props
  const api = makeApi(bp)

  const [goals, setGoals] = useState<Goal[]>([])
  const [qnaItems, setQnaItems] = useState<QnAItem[]>([])
  const [defaultQnaItemId, setDefaultQnaItemId] = useState('')
  const [defaultGoalId, setDefaultGoalId] = useState('')
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [feedbackItemsLoading, setFeedbackItemsLoading] = useState(true)
  const [currentFeedbackItem, setCurrentFeedbackItem] = useState<FeedbackItem>(undefined)
  const [selectedTabId, setSelectedTabId] = useState<SelectedTabId>('pending')

  useEffect(() => {
    const fetchGoals = async () => {
      const goals = await api.getGoals()
      setGoals(goals)
      setDefaultGoalId(goals[0].id)
    }
    // tslint:disable-next-line: no-floating-promises
    fetchGoals()
  }, [])

  useEffect(() => {
    const fetchQnaItems = async () => {
      const qnaItems = await api.getQnaItems()
      setQnaItems(qnaItems)
      setDefaultQnaItemId(qnaItems[0].id)
    }
    // tslint:disable-next-line: no-floating-promises
    fetchQnaItems()
  }, [])

  useEffect(() => {
    const initializeState = async () => {
      const feedbackItems = (await api.getFeedbackItems()).map(i => {
        i.correctedActionType = i.correctedActionType || 'qna'
        i.correctedObjectId = i.correctedObjectId || defaultQnaItemId
        i.status = i.status || 'pending'
        return i
      })

      setFeedbackItems(feedbackItems)
      setFeedbackItemsLoading(false)

      setCurrentFeedbackItem(getPendingFeedbackItems()[0])
    }
    // tslint:disable-next-line: no-floating-promises
    initializeState()
  }, [])

  const getSolvedFeedbackItems = () => {
    return feedbackItems.filter(i => i.status === 'solved')
  }

  const getPendingFeedbackItems = () => {
    return feedbackItems.filter(i => i.status === 'pending')
  }

  if (feedbackItems.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', placeContent: 'center' }}>
        <Callout title={'No feedback items'} style={{ width: '30%', margin: 'auto' }}>
          Feedback items are created when chat users give negative feedback on bot messages
        </Callout>
      </div>
    )
  }

  if (feedbackItemsLoading) {
    return <Callout>Loading...</Callout>
  }

  const updateFeedbackItem = async (item: FeedbackItem) => {
    const listClone = [...feedbackItems]
    const idx = listClone.findIndex(e => e.eventId === item.eventId)
    listClone[idx] = item
    setFeedbackItems(listClone)
  }

  return (
    <Container sidePanelWidth={750}>
      <div className={style.feedbackItemsContainer}>
        <h2>Feedback Items</h2>
        <Tabs
          selectedTabId={selectedTabId}
          onChange={(newTabId: SelectedTabId) => {
            setSelectedTabId(newTabId)
            if (newTabId === 'pending') {
              setCurrentFeedbackItem(getPendingFeedbackItems()[0])
            } else {
              setCurrentFeedbackItem(getSolvedFeedbackItems()[0])
            }
          }}
        >
          <Tab
            id="pending"
            title={
              <>
                <Icon icon="issue" /> Pending
              </>
            }
            panel={
              <FeedbackItemPanel
                feedbackItems={getPendingFeedbackItems()}
                goals={goals}
                qnaItems={qnaItems}
                contentLang={contentLang}
                bp={bp}
                onItemClicked={clickedItem => {
                  setCurrentFeedbackItem(clickedItem)
                }}
                currentFeedbackItem={currentFeedbackItem}
                defaultGoalId={defaultGoalId}
                defaultQnaItemId={defaultQnaItemId}
                onSave={savedItem => updateFeedbackItem(savedItem)}
              />
            }
          />
          <Tab
            id="solved"
            title={
              <>
                <Icon icon="tick" /> Solved
              </>
            }
            panel={
              <FeedbackItemPanel
                feedbackItems={getSolvedFeedbackItems()}
                goals={goals}
                qnaItems={qnaItems}
                contentLang={contentLang}
                bp={bp}
                onItemClicked={clickedItem => {
                  setCurrentFeedbackItem(clickedItem)
                }}
                currentFeedbackItem={currentFeedbackItem}
                defaultGoalId={defaultGoalId}
                defaultQnaItemId={defaultQnaItemId}
                onSave={savedItem => updateFeedbackItem(savedItem)}
              />
            }
          />
        </Tabs>
      </div>

      {currentFeedbackItem && <Conversation api={api} feedbackItem={currentFeedbackItem} />}
    </Container>
  )
}
