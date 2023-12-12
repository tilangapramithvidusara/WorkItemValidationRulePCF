export const LogicSample = [
  {
    ifBlock: {
      logic: {
        or: [
          {"==": [{var: 'Question01'}, "String01"]},
          {"==": [{var: 'Question01'}, "String01"]},
        ]
      },
      actions: ['Show']
    },
    elseBlock: {
      logic: {},
      actions: ['Hide']
    }
  },
  {
    ifBlock: {
      logic: {
        "==": [{var: 'Question01'}, "String01"]
      },
      actions: ['Show']
    },
    elseBlock: {
      logic: {},
      actions: ['Hide']
    }
  }
]

export const LogicNewSample = {
  ifConditions: [
      {
          index: 1,
          blocks: [
              {
                  if: {
                      conditions: [
                          {
                              Row: 3,
                              expression: '==',
                              Field: 'Question01',
                              Operator: 'or',
                              Value: 'String01',
                          },
                          {
                              Row: 4,
                              expression: '>',
                              Field: 'Question02',
                              Operator: 'or',
                              Value: 'String01',
                          }
                      ],
                      actions: ['show', 'hide'],
                      minMax: {
                          min: 123,
                          max: 234,
                          value: 'Question01' // This is optional
                      }
                  },
              },
          ],
      },
      {
          index: 2,
          blocks: [
              {
                  if: {
                      conditions: [
                          {
                              Row: 10,
                              expression: '<',
                              Field: 'Question03',
                              Operator: '',
                              Value: 'String01',
                          },
                          {
                              Row: 11,
                              expression: '<',
                              Field: 'Question03',
                              Operator: 'and',
                              Value: 'String01',
                          },
                          {
                              Row: 13,
                              expression: '<',
                              Field: 'Question03',
                              Operator: 'and',
                              Value: 'String01',
                          }
                      ],
                      actions: ['show', 'hideAndOutput'],
                  },
              },
          ],
      },
  ],
  elseConditions: [{
      conditions: [],
      actions: ['disable', 'show'],
  }],
}

export const questionArraySample = [{
  "@odata.etag": "W/\"7392108\"",
  "gyde_name": "NTemp_C01_s01_gt",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "String",
  "gyde_answertype": 528670004,
  "gyde_shortname": "gt",
  "questionType": "numeric",
  "gyde_surveytemplatechaptersectionquestionid": "7cf0f07a-41f5-ed11-8848-000d3a338dd2"
},
{
  "@odata.etag": "W/\"7940133\"",
  "gyde_name": "NTemp_C01_04_Q_04",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "Date",
  "gyde_answertype": 528670004,
  "gyde_shortname": "Q_04",
  "questionType": "Date",
  "gyde_surveytemplatechaptersectionquestionid": "52020283-6af5-ed11-8848-000d3a338dd2"
},
{
  "@odata.etag": "W/\"7404144\"",
  "gyde_name": "NTemp_C2_S1_Q1",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "String",
  "gyde_answertype": 528670004,
  "gyde_shortname": "Q1",
  "questionType": "numeric",
  "gyde_surveytemplatechaptersectionquestionid": "c3cb7139-6cf5-ed11-8848-000d3a338dd2"
},
{
  "@odata.etag": "W/\"6472352\"",
  "gyde_name": "NTemp_C01_s01_grid",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "Numeric",
  "gyde_answertype": 528670004,
  "gyde_shortname": "grid",
  "questionType": "numeric",
  "gyde_surveytemplatechaptersectionquestionid": "4635af14-dbee-ed11-8849-000d3a338dd2"
},
{
  "@odata.etag": "W/\"6487437\"",
  "gyde_name": "NTemp_C01_s01_grd",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "Numeric",
  "gyde_answertype": 528670004,
  "gyde_shortname": "grd",
  "questionType": "numeric",
  "gyde_surveytemplatechaptersectionquestionid": "8f08d012-e2ee-ed11-8849-000d3a338dd2"
},
{
  "@odata.etag": "W/\"7376952\"",
  "gyde_name": "NTemp_C01_s01_qr3",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "List",
  "gyde_answertype": 528670004,
  "gyde_shortname": "qr3",
  "questionType": "numeric",
  "gyde_surveytemplatechaptersectionquestionid": "a8727af8-e3ee-ed11-8849-000d3a338dd2"
},
{
  "@odata.etag": "W/\"6495402\"",
  "gyde_name": "NTemp_C01_s03_q01",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "List",
  "gyde_answertype": 528670004,
  "gyde_shortname": "q01",
  "questionType": "numeric",
  "gyde_surveytemplatechaptersectionquestionid": "b6ec4ebd-83f0-ed11-8849-000d3a338dd2"
},
{
  "@odata.etag": "W/\"7735770\"",
  "gyde_name": "NTemp_C01_s01_gdRD",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "List",
  "gyde_answertype": 528670004,
  "gyde_shortname": "gdRD",
  "questionType": "text",
  "gyde_surveytemplatechaptersectionquestionid": "30581950-61f8-ed11-8849-000d3a338dd2"
},
{
  "@odata.etag": "W/\"7723318\"",
  "gyde_name": "NTemp_C2_S1_q02",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "List",
  "gyde_answertype": 528670004,
  "gyde_shortname": "q02",
  "questionType": "Date",
  "gyde_surveytemplatechaptersectionquestionid": "441e2655-69f8-ed11-8849-000d3a338dd2"
},
{
  "@odata.etag": "W/\"7779661\"",
  "gyde_name": "NTemp_C03_S_01_Q_01",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "List",
  "gyde_answertype": 528670004,
  "gyde_shortname": "Q_01",
  "questionType": "Date",
  "gyde_surveytemplatechaptersectionquestionid": "cf6fb011-8af8-ed11-8849-000d3a338dd2"
},
{
  "@odata.etag": "W/\"7770616\"",
  "gyde_name": "NTemp_C01_s01_rd",
  "gyde_answertype@OData.Community.Display.V1.FormattedValue": "String",
  "gyde_answertype": 528670004,
  "gyde_shortname": "rd",
  "questionType": "Date",
  "gyde_surveytemplatechaptersectionquestionid": "55a62735-26f9-ed11-8849-000d3a338dd2"
}
]