const base = require('./_base')

function render(data) {
  const events = []

  if (data.typing) {
    events.push({
      type: 'typing',
      value: data.typing
    })
  }

  return [
    ...events,
    {
      text: data.text,
      quick_replies: data.choices.map(c => ({
        title: c.title,
        payload: c.value.toUpperCase()
      })),
      typing: data.typing,
      markdown: data.markdown
    }
  ]
}

function renderer(data) {
  const payload = base.renderer(data, 'text')
  // hardcoded at the moment, do we want to offer this flexibility ? if yes, needs to be in advanced settings
  // we might want to check if extensions module is enabled before setting it to dropdown
  const metaKey = data.suggestions.length > 4 ? '__dropdown' : '__buttons'
  return {
    ...payload,
    metadata: {
      ...payload.metadata
    }
  }
}

function renderElement(data, channel) {
  if (['web', 'slack', 'teams', 'messenger', 'telegram', 'twilio'].includes(channel)) {
    return renderer(data)
  } else {
    return render(data)
  }
}

module.exports = {
  id: 'builtin_single-choice',
  group: 'Built-in Messages',
  title: 'module.builtin.types.suggestions.title',

  jsonSchema: {
    description: 'module.builtin.types.singleChoice.description',
    type: 'object',
    required: ['choices'],
    properties: {
      text: {
        type: 'string',
        title: 'message'
      },
      choices: {
        type: 'array',
        title: 'module.builtin.types.singleChoice.choice',
        minItems: 1,
        maxItems: 10,
        items: {
          type: 'object',
          required: ['title', 'value'],
          properties: {
            title: {
              description: 'module.builtin.types.singleChoice.itemTitle',
              type: 'string',
              title: 'Message'
            },
            value: {
              description: 'module.builtin.types.singleChoice.itemValue',
              type: 'string',
              title: 'Value'
            }
          }
        }
      },
      markdown: {
        type: 'boolean',
        title: 'module.builtin.useMarkdown',
        default: true
      },
      ...base.typingIndicators
    }
  },

  uiSchema: {
    text: {
      'ui:field': 'i18n_field'
    },
    choices: {
      'ui:field': 'i18n_array'
    }
  },

  newSchema: {
    displayedIn: ['sayNode', 'qna'],
    advancedSettings: [
      {
        key: 'typing',
        defaultValue: true,
        type: 'checkbox',
        label: 'module.builtin.typingIndicator'
      },
      // TODO: not final
      {
        key: 'position',
        label: 'Position of suggestions',
        type: 'select',
        defaultValue: 'conversation',
        options: [
          { label: 'In the conversation', value: 'conversation' },
          { label: 'Static menu', value: 'static' }
        ]
      },
      {
        key: 'expiryPolicy',
        label: 'Expiry Policy',
        type: 'select',
        defaultValue: 'nbOfTurns',
        options: [
          { label: 'Number of turns', value: 'nbOfTurns' },
          { label: 'End of workflow', value: 'endOfWorkflow' }
        ]
      },
      {
        key: 'turnCount',
        defaultValue: 2,
        type: 'number',
        label: 'Nb of turns before suggestion expires'
      }
      // not supported yet, if we support we need to do so for buttons as well
      // {
      //   key: 'canAdd',
      //   type: 'checkbox',
      //   label: 'module.builtin.types.suggestions.allowToAdd'
      // },
      // not supported yet, if we support we need to do so for buttons as well
      // {
      //   key: 'multiple',
      //   type: 'checkbox',
      //   label: 'module.builtin.types.suggestions.allowMultiplePick'
      // }
    ],
    fields: [
      {
        key: 'text',
        type: 'text',
        label: 'message'
      },
      {
        key: 'suggestions',
        type: 'tag-input',
        translated: true,
        label: 'suggestions',
        placeholder: 'studio.library.addSynonyms',
        group: {
          addLabel: 'studio.flow.node.addSuggestion',
          addLabelTooltip: 'studio.flow.node.addSuggestionTooltip'
        }
      }
    ]
  },
  computePreviewText: formData =>
    formData.choices && formData.text && `Choices (${formData.choices.length}) ${formData.text}`,
  renderElement: renderElement,
  hidden: true
}
