import * as React from "react";
import operationsSampleData from '../SampleData/sampleInputQuestion';
import { dbConstants } from "../constants/dbConstants";
import { LogicNewSample, questionArraySample } from "../SampleData/SampleLogicData";

declare global {
  interface Window {
    Xrm: any;
  }
}

export const loadAllQuestionsInSurvey = async () => {
  console.log('come');
  try {    
    const templateID = await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_surveytemplate").getValue()[0].id.replace("{", "").replace("}", "");
    console.log('template id =========> ', templateID);
    const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatechaptersectionquestion", "?$select=gyde_name,gyde_answertype,gyde_shortname&$filter= _gyde_surveytemplate_value eq " + templateID);
    console.log("result ===========> ", result);
    console.log('result.entities=====> ', questionArraySample);
    
    return {
      error: false,
      data: result?.entities?.length > 0 ? result?.entities : []
    }
    
  } catch (error) {
    // console.log("error ========> ", operationsSampleData);
    return {
      error: true,
      // data: [],
      data: questionArraySample
    }
  }
}

export const getCurrentState = async () => {
  try {    
    // let result = await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_relatedsurveytemplateitem").getValue();
    const entityTypeName = window.parent.Xrm.Page.ui._formContext.contextToken.entityTypeName
    console.log("entityTypeName State ===========> ", entityTypeName);
    const updatedId = parent.Xrm.Page.ui.formContext.data.entity.getId().replace("{", "").replace("}", "");

    console.log("updatedId State ===========> ", updatedId);
    // result = result?.map((obj: any) => {
      // const updatedId = obj?.id.replace("{", "").replace("}", "");
      let currentPosition;

      if (entityTypeName.includes('question')) currentPosition = 'question';
      else if (entityTypeName.includes('section')) currentPosition = 'section';
      else if (entityTypeName.includes('chapter')) currentPosition = 'chapter';
      // return { id: updatedId, currentPosition };
    // });
    return {
      error: false,
      data: [{ id: updatedId, currentPosition }]
    }
  } catch (error) {
    console.log("error ========> ", operationsSampleData);
    return {
      error: true,
      data: []
    }
  }
}

export const saveValidationRules = async(validationRuleData: object) => {
  try {
    const id = await window.parent.Xrm.Page.ui._formContext.data.entity.getId().replace("{", "").replace("}", "");
    const currentEntity = await window.parent.Xrm.Page.ui._formContext.contextToken.entityTypeName;
    console.log("validation rules data ===========> ", validationRuleData);
    
  } catch (error) {
    console.log("save error =========> ", error);
    
  }
}
  
  export const fetchRequest = async (
    entityLogicalName: any,
    id: string,
    columnsNames:string
  ): Promise<any> => {
    try {
      let result = await window.parent.Xrm.WebApi.retrieveRecord(entityLogicalName, id, columnsNames);
      let _result : any = {}
      if (result?.gyde_validationrule) _result = result[dbConstants.question.gyde_minmaxvalidationrule];
      else if(result?.gyde_visibilityrule) _result = result[dbConstants.common.gyde_visibilityrule];
      // else if(result?.gyde_validationrule?.length) _result = result[dbConstants.common.gyde_validationrule];
      else if (result?.gyde_documentoutputrule) _result = result[dbConstants.question.gyde_documentOutputRule];
      // console.log("RESULTTT", _result)
      // if (_result) {
      //   _result = JSON.parse(_result)
      //   if(!_result || !_result?.length) return { error: false, data: [], loading: false };
      // }
      console.log("fetch Result ..." , _result)
      if (typeof _result === 'object') {
        _result = {}
      } else { 
        _result = JSON.parse(_result);
      }
      
  
      return { error: false, data: _result, loading: false };
    } catch (error: any) {
      // handle error conditions
      console.log("error",error);
      return { error: true, data: [], loading: false };
    }
  };
  
  export const saveRequest = async (
    entityLogicalName: any,
    id: string,
    data:any
  ): Promise<any> => {
    try {
      let result
      console.log("saving requeesttttt", entityLogicalName, id, data);
      result = await window.parent.Xrm.WebApi.updateRecord(entityLogicalName, id, data);
      console.log("saving requeesttttt result", result);
      return { error: false, data: result, loading: false };
    } catch (error: any) {
      // handle error conditions
      console.log("error",error);
      return { error: true, data: [], loading: false };
    }
  };

export const updateDataRequest = async (
  entityLogicalName: any,
  id: any,
  data: any
): Promise<any> => {
  try {
    const result = await window.parent.Xrm.WebApi.updateRecord(
      entityLogicalName,
      id,
      data
    );
    console.log("update result",result);
    return { error: false, data: result };
  } catch (error: any) {
    console.log("update error",error);
    return { error: true, data: {} };
  }
};

export const getCurrentId = async (
): Promise<any> => {
  try {
    let id = await window.parent.Xrm.Page.ui.formContext.data.entity.getId();
    console.log("GUILDD", id);
    id = id.replace("{", "").replace("}", "");
    return { error: false, data: id };
  } catch (e) {
    console.log("GetId error", e);
    return { error: true, data: {} };
  }
};


export const getListAnswersByQuestionId = async (questionGuid: any): Promise<any> => {
  try {
    let listAnswers = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatequestionanswer", "?$filter=_gyde_relatedquestion_value eq " + questionGuid)
    console.log("listAnswers", listAnswers)
    
        for (var i = 0; i < listAnswers.entities.length; i++) {
          var result = listAnswers.entities[i];
          // Columns
          var gyde_surveytemplatequestionanswerid = result["gyde_surveytemplatequestionanswerid"];
        }
    return {
      error: false, data: listAnswers
    };
  } catch (e) {
    console.log("GetQuestion error", e);
    return { error: true, data: {} };
  }

}


export const getPublishedStatus = async (currentPositionDetails: any) : Promise<any> => {
  try {
    let currentStatus;
    let statusCode;
    let currnetGuid;

    let currentFieldName;
    let currentIdKey;
    let expectedStatusCodeForPublished;
    let isPublished = false;

    if (currentPositionDetails?.id && currentPositionDetails?.currentPosition) {
      if (currentPositionDetails?.currentPosition === 'question') {
        currentFieldName = dbConstants.question.fieldName
        currentIdKey = "gyde_surveytemplatechaptersectionid";
        expectedStatusCodeForPublished = dbConstants.question.publishedStatus;

      } else if (currentPositionDetails?.currentPosition === 'section') {
        currentFieldName = dbConstants.section.fieldName
        currentIdKey = "gyde_surveytemplatechaptersectionid"
        expectedStatusCodeForPublished = dbConstants.section.publishedStatus;

      } else if (currentPositionDetails?.currentPosition === 'chapter') {
        currentFieldName = dbConstants.chapter.fieldName
        currentIdKey = "gyde_surveytemplatechapterid"
        expectedStatusCodeForPublished = dbConstants.chapter.publishedStatus;

      }
      console.log("currentFieldName", currentFieldName);
      console.log("currentIdKey" , currentIdKey)

      if (currentFieldName && currentIdKey) {
        currentStatus = await window.parent.Xrm.WebApi.retrieveRecord(currentFieldName, currentPositionDetails?.id, "?$select=statuscode");
        console.log("current Published Status", currentStatus )
        currnetGuid = currentStatus[currentIdKey];
        statusCode = currentStatus[dbConstants.common.statusCode];
        isPublished = statusCode === expectedStatusCodeForPublished
      }
    }

    return { error: false, data: { currentStatus, isPublished, currnetGuid } }

  } catch (e) {
    console.log("Published Status Error", e);
    return { error: true, data: {} }
  }
}