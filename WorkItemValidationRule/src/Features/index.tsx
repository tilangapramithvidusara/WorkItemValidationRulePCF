import React, { useEffect, useState } from "react";
import {
  convertJSONFormatToDBFormat,
  findAndUpdateLastNestedIf,
  removeIfKeyAndGetDbProperty
} from "../Utils/logics.utils";;
import { Button, notification, Space, Spin } from "antd";
import SectionContainer from "./sectionContainer";
import {
  getCurrentState,
  fetchRequest,
  saveRequest,
  loadAllQuestionsInSurvey,
  getPublishedStatus,
} from "../XRMRequests/xrmRequests";
import { dbConstants } from "../constants/dbConstants";
import { normalConverter } from "../Utils/dbFormatToJson";
import { hasNullFields } from "../Utils/utilsHelper";

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
  // const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>();
  const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>({
    currentPosition: "question",
  });
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
  const [deleteSectionKey, setDeleteSectionKey] = useState<any>();
  const [validation, setValidation] = useState<any>({
    minMaxValidation: true,
    andOrValidation: true,
    nestingLevelValidation: true,
  });
  const [suerveyIsPublished, setSuerveyIsPublished] = useState<boolean>(false);

  let addNestedComponent = () => {
    setSections([
      ...sections,
      {
        key:
          sections && sections.length
            ? Math.max(...sections.map((item) => item.key)) + 1
            : 1,
      },
    ]);
    setIsNested(true);
  };

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

  const loadQuestionHandler = async () => {
    setIsApiDataLoaded(true);
    const result = await loadAllQuestionsInSurvey();
    console.log("resss =====> ", result);
    let questionListArray = result.data || [];
    if (questionListArray && questionListArray.length) {
      const formattedQuestionList = questionListArray.map((quesNme: any) => {
        if (
          quesNme &&
          quesNme[
            "gyde_answertype@OData.Community.Display.V1.FormattedValue"
          ] !== "Grid" &&
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
  }, [_nestedRows]);

  // for retrieve purpose
  useEffect(() => {
    setSections(
      _nestedRows
        .map((item: {}) => Object.keys(item))
        .flat()
        .map((key: any) => ({ key: parseInt(key) }))
    );
    _getCurrentState();
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
            const isNestedIfs = visibilityDta?.some((x: {}) => Object.keys(x)[0] === 'if')
            console.log("Fetch Type isRetrieveAsNormal ", isRetrieveAsNormal);
            console.log("Fetch Type isFirstExp", isFirstExp);
            console.log("Fetch Type isAllAreNormal", isAllAreNormal);
            console.log("Fetch Type isNestedIfs", isNestedIfs);

            if (isNestedIfs) {
              refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
            }
            else if (isAllAreNormal) {
              refactorDta = visibilityDta[0]?.or;
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              refactorDta = visibilityDta;
            } else if (isFirstExp) {
              // refactorDta = visibilityDta;
              refactorDta = [{ or: Object.values(visibilityDta[0])[0] }];
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
                      {
                        checkBoxValues: [
                          {
                            show: {
                              logicalName: "Show",
                              value: "show",
                            },
                          },
                        ],
                      },
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
    let minMaxPreviousValues: any;
    let documentOutputRule: any;
    setIsApiDataLoaded(false);
    let logicalName;
    if (currentPossitionDetails?.currentPosition === "chapter") {
      logicalName = dbConstants.chapter.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "section") {
      logicalName = dbConstants.section.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "question") {
      logicalName = dbConstants.question.fieldName;
    }

    if (
      logicalName &&
      currentPossitionDetails?.id &&
      (currentPossitionDetails?.currentPosition === "chapter" ||
        currentPossitionDetails?.currentPosition === "section")
    ) {
      visibilityRulePreviousValues = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.common.gyde_visibilityrule}`
      );
    } else if (
      logicalName &&
      currentPossitionDetails?.id &&
      currentPossitionDetails?.currentPosition === "question"
    ) {
      minMaxPreviousValues = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.question.gyde_minmaxvalidationrule}`
      );

      visibilityRulePreviousValues = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.common.gyde_visibilityrule}`
      );
      documentOutputRule = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.question.gyde_documentOutputRule}`
      );
    }
    if (visibilityRulePreviousValues?.data && Object.keys(visibilityRulePreviousValues?.data).length !== 0) {
      console.log(
        "visibilityRulePreviousValues -----> ",
        visibilityRulePreviousValues
      );
      let _visibilityRulePreviousValues = JSON.parse(
        JSON.stringify(visibilityRulePreviousValues)
      );
      _setVisibilityRulePrev((prevData: any) => [
        ...prevData,
        { visibility: _visibilityRulePreviousValues?.data },
      ]);
    }

    if (minMaxPreviousValues?.data && Object.keys(minMaxPreviousValues?.data).length !== 0) {
      let _minMaxPreviousValues = JSON.parse(
        JSON.stringify(minMaxPreviousValues)
      );
      _setMinMaxRulePrev((prevData: any) => [
        ...prevData,
        { minMax: _minMaxPreviousValues?.data },
      ]);
    }

    // if (validationRulePreviousValues?.data?.length) _setEnabledPrev((prevData: any) => [...prevData, { validation: validationRulePreviousValues?.data }]);
    if (documentOutputRule?.data && Object.keys(documentOutputRule?.data).length !== 0) {
      let _documentOutputRule = JSON.parse(JSON.stringify(documentOutputRule));
      _setDocumentOutputRulePrev((prevData: any) => [
        ...prevData,
        { docRuleOutput: _documentOutputRule?.data },
      ]);
    }

    //test
    _setVisibilityRulePrev((prevValue) => [
      ...prevValue,
      {
        visibility:
        {"or" : [
          {"and" : [
            {"==": [{ var: "FSCM_PL_INV_001"}, "Y"]},
            {"==": [{ var: "FSCM_PL_INV_007"}, "Two"]},
            {"==": [{ var: "FSCM_PL_INV_010"}, "AMT"]},
          ]},
          {"and" : [
            {"==": [{ var: "FSCM_PL_INV_001"}, "Y"]},
            {"==": [{ var: "FSCM_PL_INV_007"}, "Three"]},
            {"==": [{ var: "FSCM_PL_INV_010"}, "AMT"]},
          ]},
          {"and" : [
            {"==": [{ var: "FSCM_PL_INV_001"}, "Y"]},
            {"==": [{ var: "FSCM_PL_INV_007"}, "Two"]},
            {"==": [{ var: "FSCM_PL_INV_010"}, "AP"]},
          ]},
          {"and" : [
            {"==": [{ var: "FSCM_PL_INV_001"}, "Y"]},
            {"==": [{ var: "FSCM_PL_INV_007"}, "Three"]},
            { "==": [{ var: "FSCM_PL_INV_010" }, "AP"] },
            {
              "or": [{"==": [{ var: "FSCM_PL_INV_001"}, "Y"]}]
            }
          ]
          
          }
          ]}
      }
    ])
   };
  const getCurrentPublishedStatus = async () => {
    const { data = null } = await getPublishedStatus(currentPossitionDetails);
    console.log("Published Status", data);
    if(data?.isPublished) setSuerveyIsPublished(data?.isPublished);
  }
  useEffect(() => {
    console.log("currentId ----->", currentPossitionDetails);

    getRequestedData();
    loadQuestionHandler();
    if (currentPossitionDetails) {
      getCurrentPublishedStatus();
    }
  }, [currentPossitionDetails]);

  useEffect(() => {
    console.log("deleteSectionKey", deleteSectionKey);
    if (deleteSectionKey) {
      _setNestedRows((prevNestedRows: any) => {
        if (prevNestedRows && prevNestedRows.length === 1) {
          saveVisibilityData({});
        }
        return prevNestedRows.filter(
          (key: any) => parseInt(Object.keys(key)[0]) !== deleteSectionKey
        )
      });
      setSections((prev: any) =>
        prev.filter((prevKeys: any) => prevKeys.key !== deleteSectionKey)
      );
    }
  }, [deleteSectionKey]);

  const _getCurrentState = async () => {
    const result = await getCurrentState();
    console.log("Current State Details ----> ", result);
    if (result?.data?.length) setCurrentPossitionDetails(result?.data[0]);
  };

  const saveVisibilityData = async (
    visibilityRule: any,
  ) => {
    let logicalName;
    
    if (currentPossitionDetails?.currentPosition === "question") {
      logicalName = dbConstants.question.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "section") {
      logicalName = dbConstants.section.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "chapter") {
      logicalName = dbConstants.chapter.fieldName;
    }
    console.log("logicalName when saving", logicalName);
    console.log(
      "logicalName when saving currentPossitionDetails",
      currentPossitionDetails
    );

    if (
      currentPossitionDetails?.id &&
      (currentPossitionDetails.currentPosition === "section" ||
        currentPossitionDetails?.currentPosition === "chapter") 
    ) {
      await saveRequest(logicalName, currentPossitionDetails?.id, {
        [dbConstants.common.gyde_visibilityrule]:
          JSON.stringify(visibilityRule),
      });
    } else if (
      currentPossitionDetails?.id &&
      currentPossitionDetails?.currentPosition === "question"
    ) {
      console.log("Before Saving visibilityRule", visibilityRule);
        await saveRequest(logicalName, currentPossitionDetails?.id, {
          [dbConstants.common.gyde_visibilityrule]:
            JSON.stringify(visibilityRule),
        });
    }
    openNotificationWithIcon("success", "Data Saved!");
  };
  const handleSaveLogic = () => {
    let visibilityRule: any = [];
    let visibilityRuleNormal: any = [];
    _nestedRows.forEach((sec: any) => {
      console.log("SECCCCCCCC", sec);
      const key = Object.keys(sec)[0];
      let prepareForValidation = JSON.parse(JSON.stringify(sec[key].fields));
      console.log("prepareForValidation", prepareForValidation);
      prepareForValidation[0].expression = "Emp";
      const _hasNullFields = hasNullFields(prepareForValidation);
      if (_hasNullFields) {
        openNotificationWithIcon("error", "Fields cannot be empty!");
        return;
      }
      const _visibility = convertJSONFormatToDBFormat(sec[key], true);
      visibilityRuleNormal.push(_visibility);
      visibilityRule = findAndUpdateLastNestedIf(
        visibilityRule,
        { if: [_visibility] },
        false
      );
    });
    let savedVisibilityRuleFinalFormat: any = [];
      if (
        visibilityRuleNormal.length > 0 &&
        Object.keys(visibilityRuleNormal[0])[0] === ""
      ) {
        savedVisibilityRuleFinalFormat = {
          if: visibilityRuleNormal
        };

      } else {
        savedVisibilityRuleFinalFormat = {
          if: [
            {
              or: visibilityRuleNormal,
            },
          ]
        };
      }
    console.log(
      "savedVisibilityRuleFinalFormat",
      savedVisibilityRuleFinalFormat
    );
    saveVisibilityData(
      savedVisibilityRuleFinalFormat ? savedVisibilityRuleFinalFormat : {},
    )
  };

  return (
    <div>
      {contextHolder}
      <div></div>
      {!isApiDataLoaded ? (
        <div className="validation-wrap">
          {currentPossitionDetails && (
            <div>
              <div className="nestedBtns">
                <Button
                  className="mr-10 btn-default"
                  onClick={addComponent}
                  disabled={suerveyIsPublished}>
                  + Add
                </Button>
              </div>
              {sections?.length > 0 &&
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
                      setDeleteSectionKey={setDeleteSectionKey}
                      imageUrls={{ imageUrl, imageUrl1, imageUrl2 }}
                      suerveyIsPublished={suerveyIsPublished}
                    />
                  </div>
                ))}

              {_nestedRows?.length > 0 && (
                <div className="text-right">
                  <Button
                    onClick={handleSaveLogic}
                    className="mr-10 btn-primary"
                    disabled={suerveyIsPublished}
                  >
                    Save
                    
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Space size="middle">
          <div>
            <div>Questions Loading!</div>
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
