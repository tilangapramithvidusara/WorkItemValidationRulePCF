
const actionMapper = {
    question_actions: {
        actions: {
            if_actions: [
                {
                    displayName: 'Show',
                    value: 'show'
                },
                {
                    displayName: 'Enable',
                    value: 'enable'
                },
                {
                    displayName: 'Show in Document',
                    value: 'OutPutDoc:Show'
                },
        ],
        else_actions: [
            {
                displayName: 'Hide',
                value: 'hide'
            }
        ]
        }
    },
    section_actions: {
        actions: {
            if_actions: [
                {
                    displayName: 'Disable',
                    value: 'disable'
                },
                {
                    displayName: 'Hide',
                    value: 'hide'
                },
                {
                    displayName: 'Enable',
                    value: 'enable'
                }
        ],
        else_actions: [
            {
                displayName: 'Disable',
                value: 'disable'
            },
            {
                displayName: 'Hide',
                value: 'hide'
            },
            {
                displayName: 'Enable',
                value: 'enable'
            }
        ]
        }
    },
    chapter_actions: {
        actions: {
            if_actions: [
                {
                    displayName: 'Disable',
                    value: 'disable'
                },
                {
                    displayName: 'Hide',
                    value: 'hide'
                },
                {
                    displayName: 'Enable',
                    value: 'enable'
                }
        ],
        else_actions: [
            {
                displayName: 'Disable',
                value: 'disable'
            },
            {
                displayName: 'Hide',
                value: 'hide'
            },
            {
                displayName: 'Enable',
                value: 'enable'
            }
        ]
        }
    }

}

export default actionMapper;