import * as React from "react";
import operationsSampleData from '../SampleData/sampleInputQuestion';
import { dbConstants } from "../constants/dbConstants";
import { LogicNewSample, questionArraySample } from "../SampleData/SampleLogicData";
import { filterKeys } from "../constants/filterKeys";

declare global {
  interface Window {
    Xrm: any;
  }
}

export const loadAllQuestionsInSurvey = async (surveyTemplateId: any) => {
  try {    
    console.log('template id =========> ', surveyTemplateId);
    const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatechaptersectionquestion", "?$select=gyde_name,gyde_answertype,statecode,_gyde_surveytemplatechaptersection_value,gyde_shortname,gyde_internalid&$filter= _gyde_surveytemplate_value eq " + surveyTemplateId);
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
    if (currentPosition?.includes('gyde_surveytemplate') || currentPosition?.includes('gyde_workitemtemplate')) {
      const paneIdObj = await window.parent.Xrm.App.sidePanes.getAllPanes()._collection;
      const sequenceId = Object.keys(paneIdObj)[0]
      const res = await getWorkItemIdBySequenceId(sequenceId);
      console.log("sequence result", res)
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

export const updateRelationshipForWI = async (workitemId?: any, updateRecordDetails?: any, reletedSurveyItemId?: string): Promise<any> => {
  try {
    const updatedRecordResults: any[] = [];
    const workitemDetails = await window.parent.Xrm.WebApi.retrieveRecord("gyde_surveyworkitem", workitemId);
    console.log("Updating WI", workitemDetails)
    updateRecordDetails?.forEach(async (rcd: any) => {
      let record: any = {};
      // record["gyde_surveyworkitem@odata.bind"] = `/gyde_surveyworkitems(${workitemId})`; // Lookup
      // record["gyde_relatedsurveyitemid"] = rcd?.internalId;
      // record["gyde_itemtype"] = dbConstants?.common?.item_type_question;
      record["gyde_isusedincreationrule"] = rcd?.usedInCreationRule === "false" ? false : true;
      // record["gyde_iscopydesignnotes"] = false
      // record["gyde_isincludeindevopsoutput"] = false
      // record["gyde_name"] = `${rcd?.value} - ${workitemDetails?.gyde_title}`

      console.log("SAVED WI record", record)
      const result = await window.parent.Xrm.WebApi.updateRecord("gyde_surveyworkitemrelatedsurveyitem", reletedSurveyItemId, record);
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
      let fetchXml = `?fetchXml=<fetch top='50'>
        <entity name='gyde_surveytemplate'>
          <attribute name='gyde_surveytemplateid' />
          <attribute name='gyde_name' />
          <attribute name='gyde_versionnumber' />
          <attribute name='statuscode' />
          <link-entity name='gyde_workitemtemplate' from='gyde_workitemtemplateid' to='gyde_workitemtemplate'>
            <link-entity name='gyde_workitemtemplatesequence' from='gyde_workitemtemplate' to='gyde_workitemtemplateid'>
              <filter>
                <condition attribute='gyde_workitem' operator='eq' value='${workItemId}' />
              </filter>
            </link-entity>
          </link-entity>
        </entity>
      </fetch>`;
 
      /* Set survey item filter */
      const surveyList = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplate", fetchXml)
      console.log("surveyListsss", surveyList);
  
        /* Set survey item filter */

      // const uniqueSurveyListArr = Array.from(new Set(surveyList?.entities?.map((obj: any) => obj?.gyde_name)))?.map(gyde_name => surveyList?.entities?.find((obj: any) => obj?.gyde_name === gyde_name));
      // return { error: false, data: surveyList?.entities }
      const draftSurveyList =  surveyList?.entities?.filter((obj : any) => obj["statuscode@OData.Community.Display.V1.FormattedValue"].includes("Draft") || obj["statuscode@OData.Community.Display.V1.FormattedValue"].includes("Published"));
      console.log("draftSurveyList", draftSurveyList);

      const latestVersions : any = {};
      surveyList?.entities.forEach((item: { gyde_name: any; gyde_versionnumber: any; }) => {
        const name = item.gyde_name;
        const version = item.gyde_versionnumber;

        if (!latestVersions[name] || version > latestVersions[name]) {
          latestVersions[name] = version;
        }
      });

      // Filter the surveyList based on the latest versions
      const filteredSurveyList = surveyList?.entities.filter((item: { gyde_name: any; gyde_versionnumber: any; }) => {
        const name = item.gyde_name;
        const version = item.gyde_versionnumber;
        return version === latestVersions[name];
      });

      console.log(filteredSurveyList);


      return { error: false, data: filteredSurveyList}
    } catch (e) {
      console.log("Fetch Survey Lists Error", e);
      return { error: true, data: []
    }
    }
}
  

export const getWorkItemIdBySequenceId = async (sequenceId: any): Promise<any> => {
  try {
    console.log("Error occured hereeee")
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

      /* Set survey item filter */
      const workitemRelationshipList = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveyworkitemrelatedsurveyitem", fetchXml)
      console.log("workitemRelationshipList", workitemRelationshipList);

      // return { error: false, data: surveyList?.entities }
    const filterResult = workitemRelationshipList?.entities?.filter(
      (entities: any) => entities
        // entities?.gyde_itemtype === dbConstants?.common?.item_type_answer ||
        //   entities?.gyde_itemtype === dbConstants?.common?.item_type_question
        // &&
        // entities?.gyde_isusedincreationrule
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
    let fetchXml = `?fetchXml=<fetch top="50"> 
    <entity name="gyde_surveytemplatechaptersectionquestion">
      <attribute name="gyde_surveytemplate" />
    <filter>
    <condition attribute="gyde_name" operator="eq" value="${questionName}" />
    </filter>
    </entity>
    </fetch>`;

      /* Set survey item filter */
      const questionDetails = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatechaptersectionquestion", fetchXml); 
    console.log("questionDetails", questionDetails);

    const surveyName = questionName?.split("_")[0];
    console.log("surveyName", surveyName);
    questionDetails["_gyde_surveytemplate_value@OData.Community.Display.V1.FormattedValue"]
    const findSurveyName = questionDetails?.entities?.find((suv: any) => suv["_gyde_surveytemplate_value@OData.Community.Display.V1.FormattedValue"] === surveyName);
    console.log("findSurveyName", findSurveyName);

    return { error: false, data: findSurveyName }
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

export const loadResourceString = async () : Promise<any> => {

  const url = await window.parent.Xrm.Utility.getGlobalContext().getClientUrl();
  const language = await window.parent.Xrm.Utility.getGlobalContext().userSettings.languageId
  const webResourceUrl = `${url}/WebResources/gyde_localizedstrings.${language}.resx`;
  const mapper: any = [];

  try {
    const response = await fetch(`${webResourceUrl}`);
    const data = await response.text();
    console.log("Web Res Dataaa", data);
    console.log("Filter Keyssss", filterKeys);
    filterKeys?.map((filterKey: string, index: number) => {
      const parser = new DOMParser();
      // Parse the XML string
      const xmlDoc = parser.parseFromString(data, "text/xml");
      // Find the specific data element with the given key
      const dataNode: any = xmlDoc.querySelector(`data[name="${filterKey}"]`);
      // Extract the value from the data element
      const value: any = dataNode?.querySelector("value").textContent;
      console.log('data ====> ', index, value); 
      if (index && value) {
        mapper.push({ [filterKey]: value });
      }
    });
    
    return {
      error: false, data: mapper
    }
  } catch (e) {
    console.log("Language Translation Error", e);
    return {
      error: true, data: {}
    }
  }
  }

  export const closeTab = async () : Promise<any> =>{
    const modal : any = parent.window.document.querySelector('section[id$="popupContainer"]');
    if (modal) {
      modal?.parentNode?.removeChild(modal);
    }
  }

export const getUserRoles = async (): Promise<any> => {
  try {
    const userPrivilages = await window.parent.Xrm.Utility.getGlobalContext().userSettings.roles
      ._collection;
    const userroles = [];
    for (const userRole in userPrivilages) {
      userroles.push(userPrivilages[userRole].name);
    }
    return userroles;
  } catch (e) {
    console.log('Error', e);
  }
};

export const getWTSequenceState = async (): Promise<any> => {
  const currentPosition = await window.parent.Xrm.Page.ui._formContext._entityName;
  let stateCode: any = {};
  try {
    if (currentPosition?.includes('gyde_surveytemplate')) {
      const paneIdObj = await window.parent.Xrm.App.sidePanes.getAllPanes()._collection;
      const sequenceId = Object.keys(paneIdObj)[0];
      const recordDetails = await window.parent.Xrm.WebApi.retrieveRecord(
        'gyde_workitemtemplatesequence',
        sequenceId,
        '?$select=gyde_ispartnerupdate'
      );
      console.log('sequence record details', recordDetails);
      stateCode.stateCode = recordDetails['gyde_ispartnerupdate'] === true ? 0 : 1;
    } else {
      const stateCodeFromXRM = await window.parent.Xrm.Page.ui._formContext
        .getAttribute('statecode')
        .getValue();
      stateCode.stateCode = stateCodeFromXRM;
    }
    console.log('CURRR POS', currentPosition);
    console.log('State Code', stateCode);
    return stateCode;
  } catch (e) {
    console.log('GetWIError', e);
  }
};

export const getUrl = async (): Promise<any> => {
 
  try {
    const clientUrl = await window.parent.Xrm.Page.context.getClientUrl();
    console.log("Client URL", clientUrl);
    return clientUrl;

  } catch (e) {
    console.log('GetWIError', e);
  }
};

//new request
export const executeRequest = async(workItemTemplateId: string) => {
  try {
    console.log("workItemTemplateId",workItemTemplateId);
    
    var executePayload = {
      // Parameters
     workItemTemplateId: workItemTemplateId, // Edm.String
      
      getMetadata: function () {
        return {
          boundParameter: null,
          parameterTypes: {
            workItemTemplateId: { typeName: "Edm.String", structuralProperty: 1 }
          },
          operationType: 1,
          operationName: "gyde_GetSurveyTemplateAndSurveyQuestionFromWorkItemTemplate"
        };
      }
    };
      
    const response = await parent.window.Xrm.WebApi.execute(executePayload);
    
    if (response.ok) {
      const responseBody = await response.json();
      const result = responseBody;
      console.log(result);
      // Return Type: mscrm.gyde_GetSurveyTemplateAndSurveyQuestionFromWorkItemTemplateResponse
      // Output Parameters
      const surveytemplatelist = result["surveytemplatelist"]; // Edm.String
      console.log('surveytemplatelist * ==> ', surveytemplatelist)
      return surveytemplatelist;
    } else {
      throw new Error('Response not OK');
    }
  } catch (error: any) {
    console.log('error execute ==> ', error.message);
    return [];
  }
}


