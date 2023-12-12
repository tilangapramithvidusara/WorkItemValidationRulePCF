import React, { useEffect, useState } from "react";
import {
  convertJSONFormatToDBFormat,
  findAndUpdateLastNestedIf,
  removeIfKeyAndGetDbProperty
} from "../Utils/logics.utils";
import { Button, notification, Radio, Space, Spin, Modal } from "antd";
import SectionContainer from "./sectionContainer";
import {
  getCurrentState,
  fetchRequest,
  saveRequest,
  loadAllQuestionsInSurvey,
  getPublishedStatus,
  getWorkItemId,
  createRelationshipForWI,
  getSurveyListByWorkItemId,
  getQuestionInfoByQuestionName,
  getWorkItemRelationshipByWorkitemId,
  xrmDeleteRequest,
  reloadPage,
  getListAnswersByQuestionId,
  loadResourceString,
  updateDataRequest,
} from "../XRMRequests/xrmRequests";
import { dbConstants } from "../constants/dbConstants";
import { normalConverter } from "../Utils/dbFormatToJson";
import { hasNullFields } from "../Utils/utilsHelper";
import PickServeyContainer from "./pickServeyContainer";
import { languageConstantsForCountry } from "../constants/languageConstants";
import countryMappedConfigs from "../configs/countryMappedConfigs";
import { ExclamationCircleFilled } from "@ant-design/icons";
const { confirm } = Modal;

const ParentComponent = ({
  imageUrl,
  imageUrl1,
  imageUrl2,
}: {
  imageUrl: string;
  imageUrl1: string;
  imageUrl2: string;
}) => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [_nestedRows, _setNestedRows] = useState<any>([]);
  const [isNested, setIsNested] = useState<any>();
  const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>();
  // const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>({
  //   currentPosition: "question",
  // });
  const [_visibilityRulePrev, _setVisibilityRulePrev] = useState<any[]>([]);
  const [_enabledRulePrev, _setEnabledPrev] = useState<any[]>([]);
  const [_documentOutputRulePrev, _setDocumentOutputRulePrev] = useState<any[]>(
    []
  );
  const [_minMaxRulePrev, _setMinMaxRulePrev] = useState<any[]>([]);

  const [_minMaxPrev, _setMinMaxPrev] = useState<any[]>([]);
  const [_validationRulePrev, _setValidationRulePrev] = useState<any[]>([]);
  const [isApiDataLoaded, setIsApiDataLoaded] = useState<boolean>(false);
  const [api, contextHolder]: any = notification.useNotification();
  const [questionList, setQuestionList] = useState<any[]>([]);
  const [questionsForRelationship, setQuestionsForRelationship] = useState<any[]>([]);
  const [surveyList, setSurveyList] = useState<any[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<any>();
  const [localTest, setLocalTest] = useState<any>(false);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [initialLoadWithNoSurvey, setInitialLoadWithNoSurvey] = useState<any>(false);
  const [disableSaveButton, setDisableSaveButton] = useState<any>(false);
  const [languageConstants, setLanguageConstants] = useState<any>(
    languageConstantsForCountry.en
  );
  const [selectedLanguage, setSelectedLanguage] = useState<any>('en');
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [deleteSectionKey, setDeleteSectionKey] = useState<any>();
  const [validation, setValidation] = useState<any>({
    minMaxValidation: true,
    andOrValidation: true,
    nestingLevelValidation: true,
  });
  const [suerveyIsPublished, setSuerveyIsPublished] = useState<boolean>(false);

  let addComponent = () => {
    setSections([
      ...sections,
      {
        key:
          sections && sections.length
            ? Math.max(...sections.map((item) => item.key)) + 1
            : 1,
      },
    ]);

    setIsNested(false);
  };



  const loadQuestionHandler = async (selectedSurvey: any) => {
    setIsApiDataLoaded(true);
    if(localTest) setIsApiDataLoaded(false)
    const result = await loadAllQuestionsInSurvey(selectedSurvey);
    console.log("resss =====> ", result);
    let questionListArray = result.data || [];
    if (questionListArray && questionListArray.length) {
      const formattedQuestionList = questionListArray.map((quesNme: any) => {
        if (
          quesNme &&
          quesNme[
            "gyde_answertype@OData.Community.Display.V1.FormattedValue"
          ] !== dbConstants?.questionTypes?.dateTimeQuestion &&
          quesNme[
            "gyde_answertype@OData.Community.Display.V1.FormattedValue"
          ] !== "Header"
        )
          return {
            label: quesNme.gyde_name,
            value: quesNme.gyde_name,
            questionType:
              quesNme[
                "gyde_answertype@OData.Community.Display.V1.FormattedValue"
              ],
            questionId: quesNme?.gyde_surveytemplatechaptersectionquestionid,
            sectionId: quesNme?._gyde_surveytemplatechaptersection_value,
            status: "A",
            internalId: quesNme?.gyde_internalid
          };
      });
      formattedQuestionList &&
        formattedQuestionList.length &&
        setQuestionList(formattedQuestionList?.filter((x: any) => x));
        setIsApiDataLoaded(false);
    } else {
      setQuestionList([]);
      setIsApiDataLoaded(false);
    }
  };

  useEffect(() => {
    console.log("SECCCC", sections);
  }, [sections]);

  useEffect(() => {
    console.log("questionList", questionList);
  }, [questionList]);

  useEffect(() => {
    setSections(
      _nestedRows
        ?.map((item: {}) => Object.keys(item))
        ?.flat()
        ?.map((key: any) => ({ key: parseInt(key) }))
        .sort((a: { key: number }, b: { key: number }) => a.key - b.key)
    );
    if (_nestedRows?.length === 0 || !_nestedRows?.length)
      setIsApiDataLoaded(false);
    
    console.log("_nestedRows", _nestedRows)
  }, [_nestedRows]);

  const messageHandler = async () => {
    try {
      const languageConstantsFromResTable = await loadResourceString();
      if (languageConstantsFromResTable?.data && languageConstants?.length) {
        console.log("languageConstantsFromResTable 2", languageConstantsFromResTable);
        const mergedObject = languageConstantsFromResTable?.data.reduce((result: any, currentObject: any) => {
          return Object.assign(result, currentObject);
        }, {});
        if (Object.keys(mergedObject).length) {
          const originalConstants = languageConstants[0];
          const updatedValues = mergedObject[0];
  
          for (const key in updatedValues) {
            if (key in updatedValues && key in originalConstants) {
              originalConstants[key] = updatedValues[key];
            }
          }
          setLanguageConstants(originalConstants);
        }
      }
    } catch (error) {
      console.log('error ====>', error);
    }
  }
  

  useEffect(() => {
    console.log("languageConstants", languageConstants)
  }, [languageConstants])
  // for retrieve purpose
  useEffect(() => {
    setSections(
      _nestedRows
        .map((item: {}) => Object.keys(item))
        .flat()
        .map((key: any) => ({ key: parseInt(key) }))
    );
    _getCurrentState();
    messageHandler();
    console.log(
      "imageUrl, imageUrl1, imageUrl2",
      imageUrl,
      imageUrl1,
      imageUrl2
    );
  }, []);

  useEffect(() => {
    console.log("_visibilityRulePrev", _visibilityRulePrev);
    if (_visibilityRulePrev?.length) {
      let key = 30;
      _visibilityRulePrev.forEach((dbData) => {
        console.log("Loading Visibility Data", dbData);
        _setNestedRows((prevData: any) => {
          let visibilityString = dbData?.visibility?.if?.length ? dbData?.visibility?.if : [dbData?.visibility]
          console.log("visibilityString", visibilityString);
          if (visibilityString) {
            // const visibilityString = dbData?.visibility?.if;
            const showUpdatedDataArray: any[] = [];
            let visibilityDta = visibilityString;
            let refactorDta = visibilityDta;
            const isRetrieveAsNormal = visibilityDta?.some(
              (x: any) => x?.or?.length || x?.and?.length
            );
            const isFirstExp = visibilityDta?.some(
              (x: any) => !Object.keys(x)[0]
            );
            const isAllAreNormal = visibilityDta?.every((x: { or: any[] }) => {
              const keys = x?.or?.map((x: {}) => Object.keys(x)[0]);
              return keys?.includes("and") || keys?.includes("or");
            });
            const isNestedIfs = visibilityDta?.some((x: {}) => Object.keys(x)[0] === 'if');
            const isFirst = visibilityDta?.length === 1
            const isFirstCon = visibilityDta && visibilityDta?.length && !visibilityDta[2]
            console.log("Fetch Type isRetrieveAsNormal ", isRetrieveAsNormal);
            console.log("Fetch Type isFirstExp", isFirstExp);
            console.log("Fetch Type isAllAreNormal", isAllAreNormal);
            console.log("Fetch Type isNestedIfs", isNestedIfs);
            console.log("Fetch Type isFirstCon", isFirstCon);

            if (isNestedIfs) {
              refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              refactorDta = visibilityDta;
            } else if (isFirstCon) {
              refactorDta = [{ or: [
                { "if": visibilityDta }
              ] }]
            } else if (isAllAreNormal) {
              refactorDta = visibilityDta[0]?.or;
            } else if (isFirstExp) {
              // refactorDta = visibilityDta;
              refactorDta = [{ or: Object.values(visibilityDta[0])[0] }];
            } else if (isFirst) { 
              refactorDta = [{ or: [
                { "if": [visibilityDta[0]] }
              ] }];
            } else {
              refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
            }

            console.log(
              "Visibility DB Dataaa Converting refactorDtaaaa",
              refactorDta
            );
            if (refactorDta && refactorDta?.length) {
              refactorDta?.forEach((fieldDta: any): any => {
                console.log("Each Section Field Data", fieldDta);
                let _fieldDta = JSON.parse(JSON.stringify(fieldDta));

                showUpdatedDataArray.push({
                  [key++]: {
                    actions: [
                      // {
                      //   checkBoxValues: [
                      //     {
                      //       show: {
                      //         logicalName: "Show",
                      //         value: "show",
                      //       },
                      //     },
                      //   ],
                      // },
                    ],
                    fields: normalConverter([_fieldDta]),
                  },
                });
              });

              if (showUpdatedDataArray && showUpdatedDataArray.length) {
                console.log(
                  "Validation DB Dataaa showUpdatedDataArray ",
                  showUpdatedDataArray
                );
                console.log("Validation DB Dataaa showUpdatedDataArray ", [
                  ...prevData,
                  showUpdatedDataArray,
                ]);
                return [...prevData, ...showUpdatedDataArray];
              }
            }
          }
        });
      });
      setIsApiDataLoaded(false);
    }
  }, [_visibilityRulePrev]);

  const openNotificationWithIcon = (type: any, message: any) => {
    api[type]({
      message: type,
      description: message,
    });
  };

  const getRequestedData = async () => {
    let visibilityRulePreviousValues: any;
    setIsApiDataLoaded(false);
    let logicalName = dbConstants.question.fieldName

    visibilityRulePreviousValues = await fetchRequest(
      logicalName,
      currentPossitionDetails?.id,
      `?$select=${dbConstants.common.gyde_visibilityrule}`
    );
    console.log("visibilityRulePreviousValues", visibilityRulePreviousValues);
    if (visibilityRulePreviousValues?.data && Object.keys(visibilityRulePreviousValues?.data).length !== 0) {
      console.log(
        "visibilityRulePreviousValues -----> ",
        visibilityRulePreviousValues
      );
      let _visibilityRulePreviousValues = JSON.parse(visibilityRulePreviousValues?.data);
      if ((_visibilityRulePreviousValues && _visibilityRulePreviousValues?.data?.length) || Object.keys(visibilityRulePreviousValues?.data).length !== 0) {
        _setVisibilityRulePrev((prevData: any) => [
          ...prevData,
          { visibility: _visibilityRulePreviousValues },
        ]);
      }
    
    }

    //test
    // _setVisibilityRulePrev((prevValue) => [
    //   ...prevValue,
    //   {
    //     visibility:
    //     {"or" : [
    //       {"and" : [
    //         {"==": [{ var: "FSCM_PL_INV_001"}, "Y"]},
    //         {"==": [{ var: "FSCM_PL_INV_007"}, "Two"]},
    //         {"==": [{ var: "FSCM_PL_INV_010"}, "AMT"]},
    //       ]},
    //       {"and" : [
    //         {"==": [{ var: "FSCM_PL_INV_001"}, "Y"]},
    //         {"==": [{ var: "FSCM_PL_INV_007"}, "Three"]},
    //         {"==": [{ var: "FSCM_PL_INV_010"}, "AMT"]},
    //       ]},
    //       {"and" : [
    //         {"==": [{ var: "FSCM_PL_INV_001"}, "Y"]},
    //         {"==": [{ var: "FSCM_PL_INV_007"}, "Two"]},
    //         {"==": [{ var: "FSCM_PL_INV_010"}, "AP"]},
    //       ]},
    //       {"and" : [
    //         {"==": [{ var: "FSCM_PL_INV_001"}, "Y"]},
    //         {"==": [{ var: "FSCM_PL_INV_007"}, "Three"]},
    //         { "==": [{ var: "FSCM_PL_INV_010" }, "AP"] },
    //         {
    //           "or": [{"==": [{ var: "FSCM_PL_INV_001"}, "Y"]}]
    //         }
    //       ]
          
    //       }
    //       ]}
    //   }
    // ])

    //   _setVisibilityRulePrev((prevValue) => [
    //   ...prevValue,
    //   {
    //     visibility: { "if": [ { "==": [ { "var": "NTemp_C01_s01_grd" }, 1222 ] } ] }
    //   }
    // ]) 
  };
  const getCurrentPublishedStatus = async () => {
    const { data = null } = await getPublishedStatus(currentPossitionDetails);
    console.log("Published Status", data);
    if(data?.isPublished) setSuerveyIsPublished(data?.isPublished);
  }

  const _getSurveyListByWorkItemId = async () => {
    const { data = [] } = await getSurveyListByWorkItemId(currentPossitionDetails?.id);
    console.log("data", data)
    if(localTest) setSurveyList([
      {
          "@odata.etag": "W/\"3708593\"",
          "gyde_surveytemplateid": "710bdde6-053c-ee11-bdf4-002248079177",
          "gyde_name": "AS_Tst"
      },
      {
          "@odata.etag": "W/\"3700979\"",
          "gyde_surveytemplateid": "11cfa406-a040-ee11-be6d-002248079177",
          "gyde_name": "TS_EB2"
      }
  ])
    if (data?.length) {
      setSurveyList(data)
      if(data?.length === 1) setSelectedSurvey(data[0]?.gyde_surveytemplateid)
    }
  }
  const _getWorkItemRelationshipByWorkitemId = async () => {
    const { data = [] } = await getWorkItemRelationshipByWorkitemId(currentPossitionDetails?.id);
    console.log("RelationShipsss", data);
    if (!data?.error) {
      // const relationShipUsedInCreationRule = data?.filter((relShips: any) => relShips?.gyde_isusedincreationrule)
      // console.log("relationShipUsedInCreationRule", relationShipUsedInCreationRule)
      setRelationships(data);
    }
  }

  useEffect(() => {
    console.log("currentId ----->", currentPossitionDetails);

    if (currentPossitionDetails?.id || localTest) {
      getRequestedData();
      getCurrentPublishedStatus();
      _getSurveyListByWorkItemId();
      _getWorkItemRelationshipByWorkitemId();
    }
  }, [currentPossitionDetails]);

  // useEffect(() => {
  //   console.log("selectedSurvey", selectedSurvey);
  //   if(selectedSurvey) loadQuestionHandler(selectedSurvey);
  // }, [selectedSurvey]);

  const handleSectionRemove = (deleteSectionKey: any) => {
    console.log("Section remove hitted", deleteSectionKey)
    // setDeleteSectionKey(deleteSectionKey)
    if (deleteSectionKey) {
      _setNestedRows((prevNestedRows: any) => {
        // if (prevNestedRows && prevNestedRows.length === 1) {
        //   saveVisibilityData({});
        // }
        return prevNestedRows.filter(
          (key: any) => parseInt(Object.keys(key)[0]) !== deleteSectionKey
        )
      });
      setSections((prev: any) =>
        prev.filter((prevKeys: any) => prevKeys.key !== deleteSectionKey)
      );
    }
  }

  const _getCurrentState = async () => {
    const result = await getWorkItemId();
    console.log("Current State Details ----> ", result);
    if (result?.data) setCurrentPossitionDetails(result?.data);
  };

  useEffect(() => {
    console.log("relationships sets", relationships)
  }, [relationships]);
  
  const saveVisibilityData = async (
    visibilityRule: any,
  ) => {
    let logicalName = dbConstants.question.fieldName
    
    console.log("logicalName when saving", logicalName);
    console.log(
      "logicalName when saving currentPossitionDetails",
      currentPossitionDetails
    );

    const result = await saveRequest(logicalName, currentPossitionDetails?.id, {
      [dbConstants.common.gyde_visibilityrule]:
        // JSON.stringify(visibilityRule),
        Object.keys(visibilityRule).length === 0 ? "" : JSON.stringify(visibilityRule)
    });
    if (result?.data) {
      openNotificationWithIcon(result?.data?.error ? "error" : "success", result?.data?.error ? languageConstants?.ExpressionBuilder_ErrorOccured : languageConstants?.ExpressionBuilder_DataSaved);
    }

    await handleRelationshipEntity(); 
  };

  const handleRelationshipEntity = async () => {
    let _prepareForRelationship: any;
    let relationshipCreationArray: any = [];

    const existanceRelationshipIds = relationships?.map(rela => {
      const nameLbl = rela?.gyde_name?.split('-');
      console.log("extractedString nameLbl", nameLbl);
      if (rela?.gyde_itemtype === dbConstants?.common?.item_type_question && nameLbl?.length > 1) {
          const extractedString = nameLbl[0].trim();
          console.log("extractedString", extractedString);
          return extractedString;
      }
    })?.filter(x => x);

    console.log("existanceRelationshipIds", existanceRelationshipIds)
    for (const sec of _nestedRows) {
      console.log("SECCCCCCCC", sec);

      const key = Object.keys(sec)[0];
      _prepareForRelationship = JSON.parse(JSON.stringify(sec[key].fields));
    
      await Promise.all(_prepareForRelationship?.map(async (relField: any) => {
        let selectedValue: any = questionList?.find((x: { value: any; }) => x?.value === relField?.field);
        let answerObject: any = {};
        let questionObject: any = {};
        console.log("selectedValue xxxxxxx ", selectedValue);
        if (selectedValue?.questionType === "List") {
          console.log("RELATIONSHIPSSS", relationships);
          const relationshipSets = relationships?.map((set: any) => {
            set?.gyde_name
          });
          console.log("RELATIONSHIPSSS", relationshipSets);

          const response = await getListAnswersByQuestionId(selectedValue?.questionId);
          let listAnswers = [];
    
          if (response?.data?.entities) {
            listAnswers = response?.data.entities.map((x: any) => ({
              value: x.gyde_answervalue,
            }));
          }
    
          console.log("Relationship List Answers", listAnswers);

          if (listAnswers[0]?.value) {
            if (relField?.condition !== 'con') {
              answerObject = {
                "label": selectedValue?.label,
                "value": listAnswers?.length > 0 ? listAnswers[0]?.value : selectedValue?.value, // Set the value based on availability
                "questionType": selectedValue?.questionType,
                "questionId": selectedValue?.questionId,
                "sectionId": selectedValue?.sectionId,
                "status": selectedValue?.status,
                "internalId": selectedValue?.internalId,
                "options": listAnswers[0]?.value
              };
            }
          }
          if (!existanceRelationshipIds?.includes(selectedValue?.questionId)) {
            questionObject = {
              "label": selectedValue?.label,
              "value": selectedValue?.label, // Set the value based on availability
              "questionType": selectedValue?.questionType,
              "questionId": selectedValue?.questionId,
              "sectionId": selectedValue?.sectionId,
              "status": selectedValue?.status,
              "internalId": selectedValue?.internalId,
              "usedInCreationRule": relField?.condition === 'con' ? true : "false"
            };
          }
         
          if (Object.keys(answerObject)?.length !== 0) {
            relationshipCreationArray.push(answerObject);
          }
          if (Object.keys(questionObject)?.length !== 0) {
            relationshipCreationArray.push(questionObject);
          }  
        }
    
        console.log("selectedValueselectedValue", selectedValue);
        if (selectedValue?.questionType !== "List" && Object.keys(selectedValue)?.length !== 0) {
          // if (Object.keys(selectedValue)?.length !== 0) {
            relationshipCreationArray.push(selectedValue);
          // }
        }
      }));
    
      console.log("relationshipCreationArray", relationshipCreationArray);
    }
    
    if (relationshipCreationArray && relationshipCreationArray?.length) {
      await createRelationshipForWI(currentPossitionDetails?.id, relationshipCreationArray);
    }
    
    const sectionOrChapterRelationships = relationships?.filter(x => x["gyde_itemtype@OData.Community.Display.V1.FormattedValue"] === "Chapter" || x["gyde_itemtype@OData.Community.Display.V1.FormattedValue"] === "Section");
    console.log("sectionOrChapterRelationships", sectionOrChapterRelationships);
    if (sectionOrChapterRelationships && sectionOrChapterRelationships?.length) {
      let record : any = {};
      record["gyde_isusedincreationrule"] = false; 
      for (const relat of sectionOrChapterRelationships) {
        await updateDataRequest(dbConstants?.common?.gyde_surveyworkitemrelatedsurveyitem, relat?.gyde_surveyworkitemrelatedsurveyitemid, record);
      }
    }
    setTimeout(async () => {
      await _getWorkItemRelationshipByWorkitemId();
      await reloadPage();
      setDisableSaveButton(false);
    }, 3000); // 2000 milliseconds = 2 seconds
    
    // _nestedRows.forEach((sec: any) => {
    //   console.log("SECCCCCCCC", sec);
    //   const key = Object.keys(sec)[0];
    //   _prepareForRelationship = JSON.parse(JSON.stringify(sec[key].fields));
    //   _prepareForRelationship?.forEach(async (relField: any) => {
    //     let selectedValue: any = questionList.find((x: { value: any; }) => x?.value === relField?.field);
    //     if (selectedValue?.questionType === "List") {
    //       // selectedValue.options = relField?.value || "";

    //       const response = await getListAnswersByQuestionId(
    //         selectedValue?.questionId
    //       );
  
    //       let listAnswers = [];
    //       if (response?.data?.entities) {
    //         listAnswers = response?.data.entities.map((x: any) => ({
    //           value: x.gyde_answervalue,
    //         }));
    //         // questionListArray.push({ questionId, listAnswers: dropDownData });
    //         // setIsLoad(false);
    //       }
    //       console.log("Relationship List Answers", listAnswers);
    //       const newObject = {
    //         "label": selectedValue?.label,
    //         "value": listAnswers[0]?.value,
    //         "questionType": selectedValue?.questionType,
    //         "questionId": selectedValue?.questionId,
    //         "sectionId": selectedValue?.sectionId,
    //         "status": selectedValue?.status,
    //         "internalId": selectedValue?.internalId,
    //         "options": relField?.value
    //       };
    //       relationshipCreationArray.push(newObject);
    //     }
    //     console.log("selectedValueselectedValue", selectedValue);
    //     // console.log("existanceRelationshipIds", existanceRelationshipIds);

    //     if (Object.keys(selectedValue)?.length !== 0) {
    //       relationshipCreationArray.push(selectedValue)
    //     }
    //   });
    //   console.log("relationshipCreationArray", relationshipCreationArray);

    // });
    // // relationshipDataset = relationshipDataset?.filter((x: any) => {
    // //   relationships?.
    // // })
    // if (relationshipCreationArray && relationshipCreationArray?.length) await createRelationshipForWI(currentPossitionDetails?.id, relationshipCreationArray);
    
    // await _getWorkItemRelationshipByWorkitemId();
    // await reloadPage();
    // setDisableSaveButton(false);
  }

  const languageChangeHandler = (e: any) => {
    console.log("EEEEcdsefef", e)
    setSelectedLanguage(e?.target?.value);
    setLanguageConstants(languageConstantsForCountry[e?.target?.value]);
  }


  const handleSaveLogic = async () => {
    let visibilityRuleNormal: any = [];
    let _prepareForRelationship;
    let deleteRelationshipIds: any;
    let fieldsLables: any;

    let findNullFields = false
    setDisableSaveButton(true);

    _nestedRows.forEach((sec: any) => {
      console.log("SECCCCCCCC", sec);
      const key = Object.keys(sec)[0];
      let prepareForValidation = JSON.parse(JSON.stringify(sec[key].fields));
      _prepareForRelationship = JSON.parse(JSON.stringify(sec[key].fields));
      prepareForValidation[0].expression = "Emp";
      console.log("prepareForValidation", prepareForValidation);
      const _hasNullFields = hasNullFields(prepareForValidation);
      if (_hasNullFields) {
        // openNotificationWithIcon("error", languageConstants?.ExpressionBuilder_FieldsEmpty);
        findNullFields = true;
        return;
      }
      fieldsLables = _prepareForRelationship?.map((x: any) => x?.field);
      console.log("fieldsLables", fieldsLables);
      // const _filterFieldsForWI = sec[key]?.fields?.filter((x: any) => x?.condition !== 'con');
      // console.log("_filterFieldsForWI", _filterFieldsForWI);
      // if (_filterFieldsForWI && _filterFieldsForWI?.length) {
        let _visibility : any = convertJSONFormatToDBFormat(sec[key], true);
      console.log("_visibility before", _visibility);
      
      if (_visibility) {
        const firstKey : any = Object.keys(_visibility) 
        _visibility = _visibility[firstKey]?.filter((x: any) => x?.if?.length !== 3)
        if(_visibility?.length) visibilityRuleNormal.push({[firstKey]: _visibility });
      }

      // }
      console.log("_visibility After", visibilityRuleNormal);

    });

    if (findNullFields) {
      openNotificationWithIcon("error", languageConstants?.ExpressionBuilder_FieldsEmpty);
      setDisableSaveButton(false);
      return;
    }

    // deleteRelationshipIds = relationships?.filter(rela => {
    //   const nameLbl = rela?.gyde_name?.split('-');
    //   console.log("nameLbl", nameLbl);
    //     if (rela?.gyde_itemtype === dbConstants?.common?.item_type_answer) {
    //       return rela;
    //     } else if (nameLbl?.length > 1) {
    //       const extractedString = nameLbl[0].trim();
    //       console.log("extractedString", extractedString);
    //       console.log("extractedString", fieldsLables?.includes(extractedString));
    //       if (!fieldsLables?.includes(extractedString)) {
    //         return rela;
    //       }
    //     }
    // })?.map(x => x?.gyde_surveyworkitemrelatedsurveyitemid);
    deleteRelationshipIds = relationships?.filter(y => y["gyde_itemtype@OData.Community.Display.V1.FormattedValue"] === "Question" || y["gyde_itemtype@OData.Community.Display.V1.FormattedValue"] === "Answer")?.map(x => x?.gyde_surveyworkitemrelatedsurveyitemid);
    console.log("deleteRelationshipIds 1", deleteRelationshipIds);
    // if (deleteRelationshipIds?.length) {
    //   console.log("deleteRelationshipIds 2", deleteRelationshipIds)
    //   await xrmDeleteRequest(dbConstants?.common?.gyde_surveyworkitemrelatedsurveyitem, deleteRelationshipIds);
    // }
    const deleteResult = await xrmDeleteRequest(dbConstants?.common?.gyde_surveyworkitemrelatedsurveyitem, deleteRelationshipIds);

    if (!deleteResult?.error) {
      await _getWorkItemRelationshipByWorkitemId();
      let savedVisibilityRuleFinalFormat: any = [];
      if (
        visibilityRuleNormal.length === 1
      ) {
        if (visibilityRuleNormal[0][""] && visibilityRuleNormal[0][""][0]) {
          savedVisibilityRuleFinalFormat = visibilityRuleNormal[0][""][0]?.if[0]
          if (visibilityRuleNormal[0][""][0]?.if[1]) savedVisibilityRuleFinalFormat = visibilityRuleNormal[0][""][0]
          console.log("Length is one", savedVisibilityRuleFinalFormat)

        } else {
          console.log("Length more than one", visibilityRuleNormal[0])
          savedVisibilityRuleFinalFormat = visibilityRuleNormal[0]
        }
      }
      console.log(
        "savedVisibilityRuleFinalFormat",
        savedVisibilityRuleFinalFormat
      );
      await saveVisibilityData(
        savedVisibilityRuleFinalFormat ? savedVisibilityRuleFinalFormat : {},
      )
    }
    setDisableSaveButton(false);
  };

  useEffect(() => {
    console.log("questionsForRelationship", questionsForRelationship)
  }, [questionsForRelationship])

  const _getQuestionInfoByQuestionName = async (questionName: any) => {
    const questionDetails: any = await getQuestionInfoByQuestionName(questionName);
    console.log("questionDetails", questionDetails);
    if (questionDetails?.data) {
      const survey = surveyList?.find(x => x?.gyde_name === questionDetails?.data["_gyde_surveytemplate_value@OData.Community.Display.V1.FormattedValue"]);
      console.log("DGDDDSSSS", survey);
      if(survey?.gyde_surveytemplateid) setSelectedSurvey(survey?.gyde_surveytemplateid)
      if (!survey) setInitialLoadWithNoSurvey(true)
      else setInitialLoadWithNoSurvey(false);
    } else {
      setInitialLoadWithNoSurvey(false)
    }
  }
  useEffect(() => {
    if (surveyList?.length > 0 && _nestedRows?.length > 0) {
      _nestedRows?.forEach((sec: any) => {
        console.log("SECCCCCCCC", sec);
        const key = Object.keys(sec)[0];
        let prepareForValidation = JSON.parse(JSON.stringify(sec[key]?.fields));
        console.log("prepareForValidation", prepareForValidation);
        _getQuestionInfoByQuestionName(prepareForValidation[0]?.field);
      })
    }
  }, [surveyList, _nestedRows])

  useEffect(() => {
    if (selectedSurvey) {
      console.log("selectedSurveyselectedSurvey", selectedSurvey);
      loadQuestionHandler(selectedSurvey);
    }
  }, [selectedSurvey]);

  useEffect(() => {
    console.log("languageConstantsppppp", languageConstants)
  }, [languageConstants])

  const resetWorkItemExpression = () => {
    setIsModalOpen(true);
  }
  function handleOk(e: any) {
    console.log("HAND:E CONFIRM")
  }

  function handleCancel(e: any) {
    console.log("HAND:E CANCEL")
  }


  const clearItems = async (): Promise<void> => {
    const deleteRelationshipIds = relationships?.filter(y => y["gyde_itemtype@OData.Community.Display.V1.FormattedValue"] === "Question" || y["gyde_itemtype@OData.Community.Display.V1.FormattedValue"] === "Answer")?.map(x => x?.gyde_surveyworkitemrelatedsurveyitemid);
    console.log("deleteRelationshipIds 1", deleteRelationshipIds);
    const deleteResult = await xrmDeleteRequest(dbConstants?.common?.gyde_surveyworkitemrelatedsurveyitem, deleteRelationshipIds);
    if (!deleteResult?.error) {
      await saveVisibilityData({});
      _setNestedRows(null)
    }
  }

  const showPromiseConfirm: any = async () => {
    confirm({
      title: 'Do you want to clear the creation rule?',
      icon: <ExclamationCircleFilled />,
      content: 'When the OK button is clicked, all the relationships associated with the creation rule will be deleted.',
      onOk() {
        return clearItems();
      },
      onCancel() {},
    });
  };
  return (
    <div>
      {contextHolder}
      {/* <div className="country-lan">
        <Radio.Group
          options={countryMappedConfigs}
          onChange = { (e: any) => languageChangeHandler(e)}
          value={selectedLanguage}
          optionType="button"
          buttonStyle="solid"
      />

      </div> */}
      {!isApiDataLoaded ? (
        <div className="validation-wrap">
          {
            (initialLoadWithNoSurvey || (selectedSurvey && !surveyList?.some(e => e.gyde_surveytemplateid === selectedSurvey))) &&
            <div className="validation-text mb-15"> 
                {/* * Selected Survey Not Exists in the workitem template */}
                {`* ` + languageConstants?.ExpressionBuilder_SurveyExistsWIT}
            </div>
          }
          <div style={{textAlign:'right', position:'relative', top: '33px', marginRight:'13px'}}>
          <Space wrap>
            <Button onClick={showPromiseConfirm}>Reset</Button>
             
          </Space>
          </div>
          
        
          {((currentPossitionDetails && surveyList?.length) || localTest) && (
            
            <div>
              {
                (surveyList?.length > 1 || localTest) &&
                <div className="survey-list"> 
                  <PickServeyContainer
                    surveyList={surveyList}
                    setSelectedSurvey={setSelectedSurvey}
                    selectedSurvey={selectedSurvey}
                    _nestedRows={_nestedRows}
                      handleSectionRemove={handleSectionRemove}
                      languageConstants={languageConstants}
                  />
              </div>
              }
              
              {
                selectedSurvey && <div> 
                <div className="nestedBtns">
                  <Button
                    className="mr-10 btn-default"
                    onClick={addComponent}
                    disabled={suerveyIsPublished || _nestedRows?.length > 0}>
                     {`+ ${languageConstants?.ExpressionBuilder_AddButton}`}
                  </Button>
                </div>
                {sections?.length > 0 && questionList?.length > 0 &&
                  sections.map((section) => (
                    <div key={section.key} className="nested-wrap">
                      <SectionContainer
                        sectionLevel={section.key}
                        conditionData={conditionData}
                        setConditionData={setConditionData}
                        _setNestedRows={_setNestedRows}
                        _nestedRows={_nestedRows}
                        isNested={isNested}
                        currentPossitionDetails={currentPossitionDetails}
                        questionList={questionList}
                        setValidation={setValidation}
                        imageUrls={{ imageUrl, imageUrl1, imageUrl2 }}
                        suerveyIsPublished={suerveyIsPublished}
                        handleSectionRemove={handleSectionRemove}
                        setQuestionsForRelationship={setQuestionsForRelationship}
                        languageConstants={languageConstants}
                      />
                    </div>
                  ))}
  
                  <div className="text-right">
                    <Button
                      onClick={handleSaveLogic}
                      className="mr-10 btn-primary"
                      disabled={disableSaveButton || suerveyIsPublished}
                    >
                      {/* Save */}
                      {languageConstants?.ExpressionBuilder_SaveButtonConstants}

                    </Button>
                  </div>
              
                </div>
              }
              
              </div>
          )}
        </div>
      ) : (
        <Space size="middle">
          <div>
            <div>{languageConstants?.ExpressionBuilder_QuestionsLoadingConstants}</div>
              <div style={{marginTop: '10px'}}>
              <Spin />
            </div>
          </div>
        </Space>
      )}
    </div>
  );
};

export default ParentComponent;
