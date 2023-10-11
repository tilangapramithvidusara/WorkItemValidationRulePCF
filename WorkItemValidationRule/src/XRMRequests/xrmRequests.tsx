import * as React from "react";
import operationsSampleData from '../SampleData/sampleInputQuestion';
import { dbConstants } from "../constants/dbConstants";
import { LogicNewSample, questionArraySample } from "../SampleData/SampleLogicData";

declare global {
  interface Window {
    Xrm: any;
  }
}

export const loadAllQuestionsInSurvey = async (surveyTemplateId: any) => {
  try {    
    // const templateID = await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_surveytemplate").getValue()[0].id.replace("{", "").replace("}", "");
    console.log('template id =========> ', surveyTemplateId);
    const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatechaptersectionquestion", "?$select=gyde_name,gyde_answertype,_gyde_surveytemplatechaptersection_value,gyde_shortname,gyde_internalid&$filter= _gyde_surveytemplate_value eq " + surveyTemplateId);
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

export const getWorkItemId = async() => {
  try {
    const currentPosition = await window.parent.Xrm.Page.ui._formContext._entityName;
    console.log("CURRR POS", currentPosition);
    let workItemId
    if (currentPosition === 'gyde_surveytemplate') {
      const paneIdObj = await window.parent.Xrm.App.sidePanes.getAllPanes()._collection;
      const sequenceId = Object.keys(paneIdObj)[0]
      const res = await getWorkItemIdBySequenceId(sequenceId);
      workItemId = res?.workitemId;
    } else {
      workItemId = await window.parent.Xrm.Page.ui._formContext.data.entity.getId().replace("{", "").replace("}", "");
      console.log("validation rules data ===========> ", workItemId);
      const test = await window.parent.Xrm.Page.ui;
      console.log("WorkItemId Testt ===========> ", test);
    }


    return {
      error: false,
      data: {id: workItemId}
    }
    
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
      console.log("RESSSSS", result)
      return { error: false, data: result?.gyde_creationrule ? result?.gyde_creationrule : {}, loading: false };
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

export const createRelationshipForWI = async (workitemId: any, updateRecordDetails: any): Promise<any> => {
  try {
    const updatedRecordResults: any[] = [];
    const workitemDetails = await window.parent.Xrm.WebApi.retrieveRecord("gyde_surveyworkitem", workitemId);
    console.log("workitemDetails", workitemDetails)
    updateRecordDetails?.forEach(async (rcd: any) => {
      let record: any = {};
      record["gyde_surveyworkitem@odata.bind"] = `/gyde_surveyworkitems(${workitemId})`; // Lookup
      record["gyde_relatedsurveyitemid"] = rcd?.internalId;
      record["gyde_itemtype"] = rcd?.options ? dbConstants?.common?.item_type_answer : dbConstants?.common?.item_type_question;
      record["gyde_isusedincreationrule"] = rcd?.usedInCreationRule === "false" ? false : true;
      record["gyde_iscopydesignnotes"] = false
      record["gyde_isincludeindevopsoutput"] = false
      record["gyde_name"] = `${rcd?.value} - ${workitemDetails?.gyde_title}`

      console.log("SAVED WI record", record)
      const result = await window.parent.Xrm.WebApi.createRecord("gyde_surveyworkitemrelatedsurveyitem", record);
      console.log("result", result)
      updatedRecordResults.push(result);
      console.log("result workitem relationship", result)
    });
    return { error: false, data: updatedRecordResults }

  } catch (e) {
    console.log("Create Work Item Relationship Error", e);
    return { error: true, data: {} }
  }
}


export const getSurveyListByWorkItemId = async (workItemId: any): Promise<any> => {
  try {
    // let workItemId = await window.parent.Xrm.Page.ui.formContext.data.entity.getId().replace("{", "").replace("}", "");
    // let workItemId = "322A7003-514D-EE11-BE6F-6045BDD0EF22";
      let fetchXml = `?fetchXml=<fetch top='50'>
        <entity name='gyde_surveytemplate'>
          <attribute name='gyde_surveytemplateid' />
          <attribute name='gyde_name' />
          <filter>
            <condition attribute='statuscode' operator='in' >
              <value>1</value>
              <value>528670001</value>
            </condition>
          </filter>
          <link-entity name='gyde_workitemtemplate' from='gyde_workitemtemplateid' to='gyde_workitemtemplate'>
            <link-entity name='gyde_workitemtemplatesequence' from='gyde_workitemtemplate' to='gyde_workitemtemplateid'>
              <filter>
                <condition attribute='gyde_workitem' operator='eq' value='${workItemId}' />
              </filter>
            </link-entity>
          </link-entity>
        </entity>
      </fetch>`;

      // await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_relatedsurveyitem").setRequiredLevel("required");
      /* Set survey item filter */
      const surveyList = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplate", fetchXml)
      console.log("surveyListsss", surveyList)
      // return { error: false, data: surveyList?.entities }
      return { error: false, data:surveyList?.entities}
    } catch (e) {
      console.log("Create Work Item Relationship Error", e);
      return { error: true, data: []
    }
    }
}
  

export const getWorkItemIdBySequenceId = async (sequenceId: any): Promise<any> => {
  try {
    // let workItemId = await window.parent.Xrm.Page.ui.formContext.data.entity.getId().replace("{", "").replace("}", "");
    // let workItemId = "322A7003-514D-EE11-BE6F-6045BDD0EF22";
    let fetchXml = `?fetchXml=<fetch top="50">
    <entity name="gyde_workitemtemplatesequence">
      <filter>
        <condition attribute="gyde_workitemtemplatesequenceid" operator="eq" value="${sequenceId}" uiname="Account Categories" uitype="gyde_workitemtemplatesequence" />
      </filter>
      <link-entity name="gyde_surveyworkitem" from="gyde_surveyworkitemid" to="gyde_workitem">
        <attribute name="gyde_title" />
        <attribute name="gyde_workitemid" />
        <attribute name="gyde_surveyworkitemid" />
      </link-entity>
    </entity>
  </fetch>`;

      // await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_relatedsurveyitem").setRequiredLevel("required");
      /* Set survey item filter */
      const workitemRelationshipList = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_workitemtemplatesequence", fetchXml)
      console.log("workitemRelationshipList", workitemRelationshipList);

      // return { error: false, data: surveyList?.entities }
    // const filterResult = workitemRelationshipList?.entities?.filter(
    //   (entities: any) =>
    //     (entities?.gyde_itemtype === dbConstants?.common?.item_type_answer ||
    //       entities?.gyde_itemtype === dbConstants?.common?.item_type_question) &&
    //     entities?.gyde_isusedincreationrule
    // )
      return { error: false, workitemId: workitemRelationshipList.entities[0]["gyde_surveyworkitem1.gyde_surveyworkitemid"]}
    } catch (e) {
      console.log("Work Item Item Relationship Error", e);
      return { error: true, data: []
    }
    }
}
  


export const getWorkItemRelationshipByWorkitemId = async (workItemId: any): Promise<any> => {
  try {
    // let workItemId = await window.parent.Xrm.Page.ui.formContext.data.entity.getId().replace("{", "").replace("}", "");
    // let workItemId = "322A7003-514D-EE11-BE6F-6045BDD0EF22";
    let fetchXml = `?fetchXml=<fetch top="50"> 
      <entity name="gyde_surveyworkitemrelatedsurveyitem">
        <attribute name="createdby" />
        <attribute name="gyde_itemtype" />
        <attribute name="gyde_relatedsurveyitem" />
        <attribute name="gyde_relatedsurveyitemid" />
        <attribute name="gyde_surveyworkitem" />
        <attribute name="gyde_surveyworkitemrelatedsurveyitemid" />
        <attribute name="statuscode" />
        <attribute name="gyde_name" />
        <attribute name="gyde_isusedincreationrule" />
      <filter>
      <condition attribute="gyde_surveyworkitem" operator="eq" value="${workItemId}" />
      </filter>
      </entity>
      </fetch>`;

      // await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_relatedsurveyitem").setRequiredLevel("required");
      /* Set survey item filter */
      const workitemRelationshipList = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveyworkitemrelatedsurveyitem", fetchXml)
      console.log("workitemRelationshipList", workitemRelationshipList);

      // return { error: false, data: surveyList?.entities }
    const filterResult = workitemRelationshipList?.entities?.filter(
      (entities: any) =>
        (entities?.gyde_itemtype === dbConstants?.common?.item_type_answer ||
          entities?.gyde_itemtype === dbConstants?.common?.item_type_question) &&
        entities?.gyde_isusedincreationrule
    )
      return { error: false, data: filterResult}
    } catch (e) {
      console.log("Create Work Item Relationship Error", e);
      return { error: true, data: []
    }
    }
}
  
export const getQuestionInfoByQuestionName = async (questionName: any): Promise<any> => {
  try {
    // let workItemId = await window.parent.Xrm.Page.ui.formContext.data.entity.getId().replace("{", "").replace("}", "");
    // let workItemId = "322A7003-514D-EE11-BE6F-6045BDD0EF22";
    let fetchXml = `?fetchXml=<fetch top="50"> 
    <entity name="gyde_surveytemplatechaptersectionquestion">
      <attribute name="gyde_surveytemplate" />
    <filter>
    <condition attribute="gyde_name" operator="eq" value="${questionName}" />
    </filter>
    </entity>
    </fetch>`;

      // await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_relatedsurveyitem").setRequiredLevel("required");
      /* Set survey item filter */
      const questionDetails = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatechaptersectionquestion", fetchXml); 
      console.log("questionDetails", questionDetails)
    return { error: false, data: questionDetails?.entities?.length ? questionDetails?.entities[0] : null }
    } catch (e) {
      console.log("Create Work Item Relationship Error", e);
    return {
      error: true, data: {}
    }
    }
}


export const xrmDeleteRequest = async (entityName: any, ids: any) : Promise<any> =>{
  const promiseArray: any[] = [];
  console.log("entityName", entityName)
  console.log("entity ids", ids);
  try {
    if (ids && ids?.length) {
      for (const id of ids) {
        console.log("Delete XML", id);
        await window.parent.Xrm.WebApi.deleteRecord(entityName, id);
      }
    }
    // await Promise.all(promiseArray);
    return {
      error: false, data: {}
    }
  } catch (e) {
    console.log("Delete Work Item Relationship Error", e);
    return {
    error: true, data: {}
  }
  }
}
  

export const reloadPage = async () : Promise<any> =>{
  const promiseArray: any[] = [];
  try {
    console.log("WINDDDDDDD", window);
    if (window?.top) await window.top.Xrm.Page.ui.formContext.data.refresh();
    // await Promise.all(promiseArray);
    return {
      error: false, data: {}
    }
  } catch (e) {
    console.log("Delete Work Item Relationship Error", e);
    return {
    error: true, data: {}
  }
  }
}
