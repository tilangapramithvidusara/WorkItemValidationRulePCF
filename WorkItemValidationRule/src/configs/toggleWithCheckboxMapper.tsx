
const toggleWithCheckboxMapper = {
    question_actions: {
        if: {
            toggleActions: [{
                displayName: 'Visibility',
                value: 'visibility',
                toggleData: {
                    enabled: {
                        displayName: 'show',
                        value: 'hide'
                    },
                    disabled: {
                        displayName: 'Hide',
                        value: 'hide'
                    },
                }
            },
            {
                displayName: 'Editable',
                value: 'editable',
                toggleData: {
                    enabled: {
                        displayName: 'Enable',
                        value: 'enable'
                    },
                    disabled: {
                        displayName: 'Disable',
                        value: 'disable'
                    },
                }
                },
                {
                    displayName: 'Output Document',
                    value: 'OutPutDoc',
                    toggleData: {
                        enabled: {
                            displayName: 'Show',
                            value: 'OutPutDoc:show'
                        },
                        disabled: {
                            displayName: 'Hide',
                            value: 'OutPutDoc:hide'
                        },
                    }
                }
            ]
        },
    else: [
        {
            displayName: 'Hide',
            value: 'hide'
        }
    ]
        
    }
}

export default toggleWithCheckboxMapper;