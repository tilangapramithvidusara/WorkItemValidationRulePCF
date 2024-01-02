import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import FieldInput from "../Components/commonComponents/FieldInput";
import { Button, Input, Space, Spin, notification } from "antd";
import { expressionSampleData } from "../SampleData/expressionSampleData";
import { operationalSampleData } from "../SampleData/operationalSampleData";
import { sampleInputQuestion } from "../SampleData/sampleInputQuestion";
import NumberInputField from "../Components/commonComponents/NumberInputField";
import FieldStringInputProps from "../Components/commonComponents/StringInput";
// import deleteImg from "../assets/delete.png";
import dayjs from "dayjs";

import {
  _updateExpressionByParentId,
  findGroupId,
  generateOutputString,
  getAllChildrenIDs,
  getNearestParentByItems,
  getNestedParentLevel,
  removeByKey,
  updateAllLevelArray,
  updateByParentId,
  updateFieldByLevel,
} from "../Utils/utilsHelper";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { getListAnswersByQuestionId } from "../XRMRequests/xrmRequests";
import ListDropDown from "../Components/commonComponents/ListDropDown";
import { dbConstants } from "../constants/dbConstants";
import DatePickerCustom from "../Components/commonComponents/DatePickerCustom";
import moment from "moment";
interface NestedRowProps {
  children: React.ReactNode;
}

interface TableRowProps {
  rowIndex: number;
  rowData: any;
  setRowData: any;
  addRow: any;
  isNested: any;
  sectionLevel: number;
  setConditionData: any;
  _setNestedRows: any;
  _nestedRows: any;
  questionList: any;
  handleSectionRemove: any;
  imageUrls: any;
  suerveyIsPublished: any;
  setQuestionsForRelationship: any;
  languageConstants: any;
}

interface Condition {
  field: string;
  condition: string;
  value: string;
  sort: number;
  level: number;
  hasNested: boolean;
  innerConditions: Condition[];
}

const RowContainer: React.FC<TableRowProps> = ({
  rowIndex,
  rowData,
  setRowData,
  addRow,
  isNested,
  sectionLevel,
  setConditionData,
  _setNestedRows,
  _nestedRows,
  questionList,
  handleSectionRemove,
  imageUrls,
  suerveyIsPublished,
  setQuestionsForRelationship,
  languageConstants,
}) => {
  const [nestedRows, setNestedRows] = useState<React.ReactNode[]>([]);
  const [collapse, setCollapse] = useState<any>({ state: false, fieldId: 0 });
  const [fieldValue, setFieldValue] = useState<any>();
  const [showActionOutput, setShowActionOutput] = useState<any>();
  const [questionType, setQuestionType] = useState<any>();
  const [isLoad, setIsLoad] = useState<boolean>(false);

  const [answersDropDownData, setAnswersDropDownData] = useState<any[]>([]);
  const [api, contextHolder]: any = notification.useNotification();
  const [defaultExpression, setDefaultExpression] = useState<any>("");
  const [defaultSection, setDefaultSection] = useState<any>();
  const [dropDownQuestionList, setDropDownQuestionList] = useState<any>();
  const [listAnsersWithQuestionIds, setListAnsersWithQuestionIds] =
    useState<any>();
  const [listQuestionIds, setListQuestionIds] = useState<any>();
  const [listQuestionLoading, setListQuestionLoading] = useState<any>(false);
  const [_selectedValue, _setSelectedValue] = useState<any>(null);
  const [dropdowOperators, setDropdowOperators] = useState<any>(operationalSampleData[0]?.options);

  const [sameOperatorValidation, setSameOperatorValidation] =
    useState<any>(true);

  const handleResetSelection = () => {
    _setSelectedValue(null); // Set the selected value to null
  };
  const findConditionByLevel = (
    level: any,
    conditions: any
  ): Condition | null => {
    for (const condition of conditions) {
      if (condition.level === level) {
        return condition;
      } else if (condition.hasNested) {
        const foundCondition = findConditionByLevel(
          level,
          condition.innerConditions
        );
        if (foundCondition) {
          return foundCondition;
        }
      }
    }
    return null;
  };

  const idGenerator = (
    parentLevel: number,
    hasNested: boolean,
    nestedRowArray: any
  ) => {
    let newKey;
    if (hasNested) {
      newKey = parseInt(parentLevel + `1`);
    } else {
      const highestLevel = nestedRowArray.reduce(
        (maxLevel: number, obj: { level: number }) => {
          return obj.level > maxLevel ? obj.level : maxLevel;
        },
        0
      );
      newKey = highestLevel + 100;
    }
    console.log("New Key", newKey);
    return newKey;
  };

  const fieldValueSetToNestedRows = (fieldValue: any) => {
    const existingLevel1Index = _nestedRows.findIndex(
      (item: any) => sectionLevel in item
    );

    if (existingLevel1Index !== -1) {
      console.log("FIELDDDSADD", fieldValue);
      _setNestedRows((prevData: any) => {
        const newData = [...prevData];
        newData[existingLevel1Index] = {
          [sectionLevel]: {
            fields: updateFieldByLevel(
              newData.find((x) => x[sectionLevel])[sectionLevel].fields,
              fieldValue?.changedId,
              {
                fieldName: fieldValue?.fieldName,
                fieldValue:
                  typeof fieldValue?.input === "string"
                    ? fieldValue?.input.trim()
                    : fieldValue?.input,
                questionType: fieldValue?.questionType,
              }
            ),
            actions:
              _nestedRows?.find((x: { [x: string]: any }) => x[sectionLevel])[
                sectionLevel
              ]?.actions || [],
          },
        };
        return newData;
      });
    }
  };

  useEffect(() => {
    console.log("fieldValue", fieldValue);
    if (fieldValue) {
      fieldValueSetToNestedRows(fieldValue);
    }
    // Added validation, If the same level expression Changed other child has to be changed
    if (fieldValue?.fieldName === "expression") {
      console.log("fieldValue Exp", fieldValue);

      setDefaultExpression(fieldValue?.input);
      let releatedFields = _nestedRows?.find((x: any[]) => x[sectionLevel])?.[
        sectionLevel
      ]?.fields;
      if (releatedFields) {
        let _collapseList = getAllChildrenIDs(
          findGroupId(
            _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
              ?.fields,
            fieldValue.changedId
          )
        );
        console.log("Expressions numbers", [
          ..._collapseList,
          fieldValue.changedId,
        ]);
        _collapseList = [..._collapseList, fieldValue.changedId];
        const nearestIdParentObject = getNearestParentByItems(
          releatedFields,
          fieldValue.changedId
        );
        console.log("nearestIdParentObject", nearestIdParentObject);

        // Changed expression to the nearest parent expression
        if (nearestIdParentObject) {
          const sameLevelInnerConditions =
            nearestIdParentObject?.innerConditions;
          console.log("sameLevelInnerConditions", sameLevelInnerConditions);
          let sameLevelIds = sameLevelInnerConditions.map((x: any) => x?.level);
          console.log("sameLevelIds", sameLevelIds);
          // sameLevelIds = [...sameLevelIds, nearestIdParentObject?.level]
          const fields = _updateExpressionByParentId(
            _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
              ?.fields,
            sameLevelIds,
            fieldValue.input
          );
          _setNestedRows(
            updateAllLevelArray(_nestedRows, sectionLevel, fields)
          );
        } else {
          const parentExpressions = releatedFields?.map(
            (lvl: any) => lvl?.expression
          );
          let parentIds = releatedFields?.map((lvl: any) => lvl?.level);

          if (releatedFields?.length > 1) {
            const firstExp = releatedFields[1]?.expression;
            const initialEmptyFieldId = releatedFields[0]?.level;
            parentIds = parentIds?.filter(
              (item: any) => item !== initialEmptyFieldId
            );
            console.log("parentExpressions", parentExpressions);
            console.log("parentExpressions firstExp", firstExp);
            console.log(
              "parentExpressions firstExp",
              firstExp !== fieldValue.input
            );

            if (parentIds.length) {
              // openNotificationWithIcon(
              //   "error",
              //   "First Selected Expression cannot be changed!"
              // );
              const fields = _updateExpressionByParentId(
                _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
                  ?.fields,
                parentIds,
                firstExp
              );
              _setNestedRows(
                updateAllLevelArray(_nestedRows, sectionLevel, fields)
              );
            }
          }
        }
      }
    }
  }, [fieldValue]);

  useEffect(() => {
    console.log("fieldValue Updating", fieldValue);
    if (fieldValue?.fieldName === "field") {
      const resss: any = fetchFieldData(fieldValue?.input);
      handleResetSelection();
      // When the field value get change need to empty value field
      let _fieldValue: any = fieldValue;
      _fieldValue.input = " ";
      _fieldValue.fieldName = "value";
      fieldValueSetToNestedRows(_fieldValue);

      let __fieldValue: any = JSON.parse(JSON.stringify(fieldValue));
      __fieldValue.input = " ";
      __fieldValue.fieldName = "condition";
      fieldValueSetToNestedRows(__fieldValue);
    } else if (fieldValue?.fieldName === "condition") {
      console.log("CONNNNNNNNNN");
      let _fieldValue: any = fieldValue;
      _fieldValue.input = " ";
      _fieldValue.fieldName = "value";
      fieldValueSetToNestedRows(_fieldValue);
    }
  }, [fieldValue]);

  const addConditionToData = (
    data: any[],
    level: number,
    condition: any
  ): any[] => {
    return data.map((item) => {
      if (item.level === level) {
        // If the item matches the specified level and has nested conditions
        item.innerConditions.push(condition); // Add the newCondition to its innerConditions
      } else if (item.innerConditions.length > 0) {
        // If the item has nested conditions, recursively call the function on its innerConditions
        item.innerConditions = addConditionToData(
          item.innerConditions,
          level,
          condition
        );
      }
      return item;
    });
  };

  const _handleAddRow = (
    level: number,
    hasNested: boolean,
    expression: string = ""
  ) => {
    console.log("Clicked Level normal ", level);

    let releatedFields = _nestedRows.find((x: any[]) => x[sectionLevel]);
    if (releatedFields) {
      releatedFields = releatedFields[sectionLevel].fields;
      const nearestIdParentObject = getNearestParentByItems(
        releatedFields,
        level
      );

      let higestLevel;
      if (nearestIdParentObject?.innerConditions?.length)
        higestLevel = Math.max(
          ...nearestIdParentObject.innerConditions.map(
            (x: { level: any }) => x.level
          )
        );

      console.log("nearestId --------------> ", higestLevel);
      let newRow = {
        field: "",
        condition: "",
        value: "",
        expression: defaultExpression ? defaultExpression : "",
        sort: 1,
        level: higestLevel
          ? higestLevel + 1
          : idGenerator(level, hasNested, releatedFields),
        hasNested: false,
        innerConditions: [],
        collapse: false,
      };

      const parentIds = releatedFields.map((lvl: { level: any }) => lvl.level);
      if (parentIds.includes(level)) {
        // _setNestedRows([..._nestedRows, newRow]);

        const existingLevel1Index = _nestedRows.findIndex(
          (item: any) => sectionLevel in item
        );
        if (existingLevel1Index !== -1) {
          const currentFields = _nestedRows.map(
            (prevData: any, index: number) => prevData[sectionLevel]?.actions
          );

          _setNestedRows((prevData: any) => {
            const newData = [...prevData];
            const newFields = [...releatedFields, newRow];
            newData[existingLevel1Index] = {
              [sectionLevel]: {
                fields: newFields,
                actions:
                  _nestedRows?.find(
                    (x: { [x: string]: any }) => x[sectionLevel]
                  )[sectionLevel]?.actions || [],
              },
            };
            return newData;
          });
        }
      } else {
        if (nearestIdParentObject) {
          setNestedRows(
            updateByParentId(
              releatedFields,
              nearestIdParentObject.level,
              newRow
            )
          );
        }
      }
    }
  };

  useEffect(() => {
    const releatedSection = _nestedRows?.find((x: any[]) => x[sectionLevel])?.[
      sectionLevel
    ];
    setShowActionOutput(
      releatedSection?.actions
        ?.map((obj: {}) => Object.keys(obj)[0])
        .join(" && ")
    );
    if (releatedSection?.fields[0]) {
      setDefaultSection({
        questionName: releatedSection?.fields[0]?.field,
        sectionId: "",
      });
    }
    const questionListInNestedArr = releatedSection?.fields?.map(
      (x: any) => x?.field
    );

    if (
      releatedSection &&
      releatedSection?.fields &&
      releatedSection?.fields[1] &&
      releatedSection?.fields[1]?.expression
    ) {
      setDefaultExpression(releatedSection?.fields[1]?.expression);
    }

    setDropDownQuestionList(() => {
      if (releatedSection?.fields[1]?.expression === "&&") {
        console.log("REMOVEDDD 11111");
        return dropDownQuestionList?.map((item: { label: any }) => {
          if (questionListInNestedArr?.includes(item?.label)) {
            return { ...item, status: "I" };
          } else {
            return { ...item, status: "A" };
          }
        });
      } else {
        console.log("REMOVEDDD 22222");
        return dropDownQuestionList?.map((item: { label: any }) => {
          return { ...item, status: "A" };
        });
      }
    });

    const isContainInclude = _nestedRows
      ?.find((x: any[]) => x[sectionLevel])
      ?.[sectionLevel]?.fields?.map((lvl: any) => lvl?.condition);
    console.log("ISCONTAIN", isContainInclude);
    console.log("ISCONTAIN _nestedRows", _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]?.fields);

    console.log("ISCONTAIN", isContainInclude?.includes("con"));
    setDropdowOperators(
      _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]?.fields
        ?.length === 1
        ? operationalSampleData[0]?.options
        : isContainInclude?.includes("con")
        ? operationalSampleData[0]?.options?.filter(
            (item: { value: string }) => item?.value === "con"
          )
        : operationalSampleData[0]?.options?.filter(
            (item: { value: string }) => item?.value !== "con"
          )
    );

  }, [_nestedRows]);

  useEffect(() => {
    console.log("sectionLevelsectionLevel", sectionLevel);
    _setNestedRows(
      updateAllLevelArray(_nestedRows, sectionLevel, [
        {
          field: "",
          condition: "",
          value: "",
          sort: 1,
          level: 1,
          hasNested: isNested,
          expression: "",
          innerConditions: [],
          collapse: false,
          actions: [],
        },
      ])
    );
  }, [sectionLevel]);

  const collapseHandle = (number: any, collapse: boolean) => {
    let _collapseList = getAllChildrenIDs(
      findGroupId(
        _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
          ?.fields,
        number
      )
    );
    console.log("_collapseList number", [..._collapseList, number]);
    _collapseList = [..._collapseList, number];
    if (_collapseList && _collapseList.length) {
      if (
        _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]?.fields
          ?.length
      ) {
        const fields = _updateCollapseByParentId(
          _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
            ?.fields,
          _collapseList,
          collapse
        );
        console.log("FIELDSSSSSSSS", fields);
        _setNestedRows(updateAllLevelArray(_nestedRows, sectionLevel, fields));
      }
    }
  };

  const _updateCollapseByParentId = (
    _data: any,
    parentIds: any,
    collapse: any
  ) => {
    console.log("------------>", _data, parentIds, collapse);
    parentIds?.forEach((x: any) => {
      _data?.map((i: { level: any; innerConditions: any[]; collapse: any }) => {
        if (x === i.level) {
          i.collapse = collapse;
        } else {
          _updateCollapseByParentId(i?.innerConditions, parentIds, collapse);
        }
      });
    });

    console.log("------------ data>", _data);
    const newArr = _data ? [..._data] : [];
    return newArr;
  };

  const updateConditionCollapse = (
    conditions: Condition[],
    level: number,
    collapse: boolean
  ): Condition[] => {
    return conditions.map((condition) => {
      if (condition.level === level) {
        return { ...condition, collapse };
      }
      if (condition.innerConditions.length > 0) {
        const updatedInnerConditions = updateConditionCollapse(
          condition.innerConditions,
          level,
          collapse
        );
        return {
          ...condition,
          innerConditions: updatedInnerConditions,
          collapse,
        };
      }
      return condition;
    });
  };

  const fetchFieldData = async (questionId: any) => {
    try {
      // Make a request to the backend to fetch the data
      const questionDetails = dropDownQuestionList?.find(
        (x: any) => x.value === questionId
      );
      console.log("questionDetails", questionDetails);
      if (
        questionDetails?.questionType === dbConstants.questionTypes.listQuestion
      ) {
        setIsLoad(true);
        const response = await getListAnswersByQuestionId(
          questionDetails?.questionId
        );
        let dropDownData = [];
        if (response?.data?.entities) {
          dropDownData = response?.data.entities.map((x: any) => {
            return {
              label: x.gyde_answervalue,
              value: x.gyde_answervalue,
            };
          });
        }
        if (dropDownData && dropDownData?.length) {
          setAnswersDropDownData(dropDownData);
        }
        setIsLoad(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // setSelectedFieldData([]); // Reset the data to an empty array in case of an error
    }
  };

  useEffect(() => {
    if (collapse.fieldId !== 0) {
      collapseHandle(collapse.fieldId, collapse.state);
    }
  }, [collapse]);

  const _handleDeleteRow = (level: any) => {
    let releatedFields = _nestedRows.find((x: any[]) => x[sectionLevel]);
    if (releatedFields) {
      _setNestedRows(
        updateAllLevelArray(
          _nestedRows,
          sectionLevel,
          removeByKey(releatedFields[sectionLevel].fields, level)
        )
      );
    }
  };

  useEffect(() => {
    if (questionList && questionList.length) {
      const listQuestions = questionList
        ?.filter(
          (x: any) =>
            x["questionType"] === dbConstants?.questionTypes?.listQuestion
        )
        ?.map((x: any) => x?.value);
      let releatedFields = _nestedRows?.find((x: any[]) => x[sectionLevel]);
      if (releatedFields) {
        const fields = releatedFields[sectionLevel]?.fields?.map(
          (x: any) => x?.field
        );
        const matchedValues = listQuestions?.filter((value: any) =>
          fields?.includes(value)
        );
        console.log("matchedValues", matchedValues);
        console.log("matchedValues listQuestions", listQuestions);
        console.log("matchedValues fields", fields);

        if (matchedValues && matchedValues?.length)
          setListQuestionIds(matchedValues);
      }

      setDropDownQuestionList(
        questionList?.filter(
          (quesNme: any) =>
            quesNme &&
            // quesNme["questionType"] !== "Grid" &&
            quesNme["questionType"] !== "Header"
        )
      );
    }
  }, [questionList]);

  const fetchQuestionDetails = async (questionIds: any) => {
    const questionListArray: any = [];

    await Promise.all(
      questionIds?.map(async (questionId: any) => {
        const questionDetails = questionList?.find(
          (x: any) => x.value === questionId
        );

        if (
          questionDetails?.questionType ===
          dbConstants.questionTypes.listQuestion
        ) {
          setIsLoad(true);

          const response = await getListAnswersByQuestionId(
            questionDetails?.questionId
          );

          let dropDownData = [];
          if (response?.data?.entities) {
            dropDownData = response?.data.entities.map((x: any) => ({
              label: x.gyde_answervalue,
              value: x.gyde_answervalue,
            }));
            questionListArray.push({ questionId, listAnswers: dropDownData });
            setIsLoad(false);
          }
        }
      })
    );

    if (questionListArray && questionListArray?.length) {
      setListAnsersWithQuestionIds(questionListArray);
    }
    setListQuestionLoading(false);
  };

  useEffect(() => {
    console.log("setListQuestionIds", listQuestionIds);
    if (listQuestionIds && listQuestionIds?.length) {
      setListQuestionLoading(true);
      fetchQuestionDetails(listQuestionIds);
    }
  }, [listQuestionIds]);

  const renderNestedConditions = (conditions: any[], marginLeft = 0) => {
    console.log("conditions----->", conditions);

    if (conditions && conditions?.length) {
      const lastIndex = conditions?.length - 1;
      return conditions.map((condition: any, index: number) => (
        <div key={condition.level}>
          {!condition?.collapse ? (
            <div className="collapse-wrap">
              <div className="flex-col-start">
                <div className="flex-row-start">
                  {!condition.state && (
                    <CaretDownOutlined
                      style={{ color: "#0093FE" }}
                      onClick={() =>
                        setCollapse({
                          state: true,
                          fieldId: condition?.level,
                        })
                      }
                    />
                  )}
                  <div className="validation-text"></div>
                </div>
              </div>
              <div className="loop">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="mr-20">
                    <div className="condition-label-andor">
                      {languageConstants?.ExpressionBuilder_AndorLabel}
                    </div>
                    <DropDown
                      dropDownData={expressionSampleData}
                      isDisabled={
                        suerveyIsPublished
                          ? suerveyIsPublished
                          : index !== 1
                          ? true
                          : false
                      }
                      setExpression={
                        (
                          _nestedRows
                            ?.find((x: any[]) => x[sectionLevel])
                            ?.[sectionLevel]?.fields?.map(
                              (lvl: any) => lvl?.field
                            ) || []
                        ).some(
                          (value: any, index: any, array: any[]) =>
                            array.indexOf(value) !== index
                        ) && defaultExpression === "||"
                          ? null
                          : setFieldValue
                      }
                      changedId={condition?.level}
                      fieldName={"expression"}
                      selectedValue={
                        index === 0
                          ? ""
                          : conditions[1] && conditions[1]?.expression
                          ? conditions[1]?.expression
                          : condition?.expression
                      }
                    />{" "}
                  </div>

                  {!isLoad ? (
                    <div className="mr-20">
                      <div className="condition-label">
                        {languageConstants?.ExpressionBuilder_FieldLabel}{" "}
                      </div>
                      <FieldInput
                        sampleData={
                          // dropDownQuestionList && dropDownQuestionList.length && dropDownQuestionList?.filter((x: { status: string; }) => x?.status === "A")
                          dropDownQuestionList &&
                          dropDownQuestionList.length &&
                          dropDownQuestionList?.filter(
                            (x: { status: string }) => x?.status === "A"
                          )
                        }
                        selectedValue={condition?.field}
                        overrideSearch={false}
                        setFieldValue={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"field"}
                        isDisabled={suerveyIsPublished}
                      />{" "}
                    </div>
                  ) : (
                    <div className="mr-20">
                      <div className="condition-label">
                        {languageConstants?.ExpressionBuilder_FieldLabel}{" "}
                      </div>
                      <Space size="middle">
                        <Spin />
                      </Space>
                    </div>
                  )}
                  <div className="mr-20">
                    <div className="condition-label">
                      {languageConstants?.ExpressionBuilder_OperatorLabel}
                    </div>
                    {dropDownQuestionList?.find(
                      (x: { value: string }) => x?.value === condition?.field
                    )?.questionType ===
                    dbConstants.questionTypes.numericQuestion ? (
                      <DropDown
                        dropDownData={dropdowOperators?.filter(
                          (item: { value: string }) =>
                            item?.value === "!=" 
                        )}
                        isDisabled={
                          suerveyIsPublished ? suerveyIsPublished : false
                        }
                        setExpression={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"condition"}
                        selectedValue={condition?.condition}
                      />
                    ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType ===
                      dbConstants.questionTypes.listQuestion ? (
                      <DropDown
                        dropDownData={dropdowOperators?.filter(
                          (item: { value: string }) =>
                            item?.value === "==" ||
                            item?.value === "!=" ||
                            item?.value === "con"
                        )}
                        isDisabled={
                          suerveyIsPublished ? suerveyIsPublished : false
                        }
                        setExpression={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"condition"}
                        selectedValue={condition?.condition}
                      />
                    ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType ===
                        dbConstants.questionTypes.stringQuestion ||
                      dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType ===
                        dbConstants.questionTypes.gridQuestion ? (
                      <DropDown
                        dropDownData={dropdowOperators?.filter(
                          (item: { value: string }) =>
                            // item?.value === "==" ||
                            // item?.value === "!=" ||
                            item?.value === "con"
                        )}
                        isDisabled={
                          suerveyIsPublished ? suerveyIsPublished : false
                        }
                        setExpression={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"condition"}
                        selectedValue={condition?.condition}
                      />
                    ) : (
                      <DropDown
                        dropDownData={dropdowOperators}
                        isDisabled={
                          suerveyIsPublished ? suerveyIsPublished : false
                        }
                        setExpression={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"condition"}
                        selectedValue={condition?.condition}
                      />
                    )}
                  </div>
                  <div className="mr-20">
                    <div className="condition-label">
                      {languageConstants?.ExpressionBuilder_ValueLabel}{" "}
                    </div>
                    {condition?.condition === "con" ? (
                      <FieldStringInputProps
                        sampleData={
                          dropDownQuestionList &&
                          dropDownQuestionList.length &&
                          dropDownQuestionList
                        }
                        selectedValue={null}
                        overrideSearch={false}
                        setFieldValue={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"value"}
                        isDisabled={true}
                      />
                    ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType ===
                      dbConstants.questionTypes.numericQuestion ? (
                      <NumberInputField
                        selectedValue={condition?.value}
                        handleNumberChange={{}}
                        defaultDisabled={
                          suerveyIsPublished ? suerveyIsPublished : false
                        }
                        setInputNumber={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"value"}
                        validatingSuccess={true}
                      />
                    ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType ===
                      dbConstants.questionTypes.stringQuestion ? (
                      <FieldStringInputProps
                        sampleData={
                          dropDownQuestionList &&
                          dropDownQuestionList.length &&
                          dropDownQuestionList
                        }
                        selectedValue={condition?.value}
                        overrideSearch={false}
                        setFieldValue={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"value"}
                        isDisabled={suerveyIsPublished}
                      />
                    ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType ===
                      dbConstants.questionTypes.dateTimeQuestion ? (
                      <DatePickerCustom
                        isDisabled={
                          suerveyIsPublished ? suerveyIsPublished : false
                        }
                        setFieldValue={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"value"}
                        selectedValue={
                          condition?.value ? condition?.value : moment()
                        }
                      />
                    ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType ===
                      dbConstants.questionTypes.listQuestion ? (
                      <ListDropDown
                        dropDownData={{}}
                        isDisabled={
                          suerveyIsPublished ? suerveyIsPublished : false
                        }
                        setFieldValue={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"value"}
                        selectedValue={condition?.value}
                        listDropDownData={answersDropDownData
                          .concat(
                            listAnsersWithQuestionIds?.find(
                              (x: any) => x?.questionId === condition?.field
                            )?.listAnswers
                          )
                          ?.filter((x) => x)}
                      />
                    ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType ===
                      dbConstants.questionTypes.dateTimeQuestion ? (
                      <DatePickerCustom
                        isDisabled={
                          suerveyIsPublished ? suerveyIsPublished : false
                        }
                        setFieldValue={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"value"}
                        selectedValue={condition?.value ? condition?.value : ""}
                      />
                    ) : (
                      <FieldStringInputProps
                        sampleData={
                          dropDownQuestionList &&
                          dropDownQuestionList.length &&
                          dropDownQuestionList
                        }
                        selectedValue={condition?.value}
                        overrideSearch={false}
                        setFieldValue={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"value"}
                        isDisabled={suerveyIsPublished}
                      />
                    )}
                  </div>
                  <div className="custom-btn-wrap">
                    {suerveyIsPublished || condition?.level === 1 ? (
                      <></>
                    ) : (
                      <div className="flex-wrap">
                        <img
                          src={imageUrls?.imageUrl}
                          alt="icon"
                          // onClick={() => _handleDeleteRow(condition?.level)}
                          height={"15px"}
                          onClick={() => _handleDeleteRow(condition?.level)}
                        />
                        <span className="remove-text">
                          {languageConstants?.ExpressionBuilder_RemoveButton}{" "}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {lastIndex === index ? (
                <div className="flex-row-start mb-15 mt-15">
                  <Button
                    className="mr-10 btn-default"
                    onClick={() =>
                      _handleAddRow(condition?.level, false, "AND")
                    }
                    disabled={suerveyIsPublished}
                  >
                    {/* + Add */}
                    {/* {languageConstants?.addButton}  */}
                    {`+ ${languageConstants?.ExpressionBuilder_AddButton}`}
                  </Button>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          ) : (
            <div className="flex-row-start mb-10 collapse-wrap custom-width">
              {!condition.state && (
                <div>
                  <CaretRightOutlined
                    style={{ color: "#0093FE" }}
                    onClick={() =>
                      setCollapse({
                        state: false,
                        fieldId: condition?.level,
                      })
                    }
                  />
                  <div className="condition-label">
                    <DropDown
                      dropDownData={expressionSampleData}
                      isDisabled={
                        suerveyIsPublished
                          ? suerveyIsPublished
                          : condition?.level === 1
                          ? true
                          : false
                      }
                      setExpression={setFieldValue}
                      changedId={condition?.level}
                      fieldName={"expression"}
                      selectedValue={condition?.expression}
                    />{" "}
                  </div>
                </div>
              )}
              <div className="validation-text"></div>
            </div>
          )}
          <div style={{ paddingLeft: "30px" }}>
            {!listQuestionLoading &&
              renderNestedConditions(
                condition?.innerConditions,
                marginLeft + 5
              )}
            {/* {renderNestedConditions(condition?.innerConditions, marginLeft + 5)} */}
          </div>
        </div>
      ));
    }
  };
  useEffect(() => {
    console.log("isApiDataLoaded isLoad", isLoad);
  }, [isLoad]);
  return (
    <div>
      {contextHolder}
      {/* {!isLoad ? ( */}
      <div>
        <div style={{ textAlign: "left" }}>
          {" "}
          {_nestedRows &&
            _nestedRows?.length &&
            "if(" +
              generateOutputString(
                _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
                  ?.fields || []
              ) +
              ")"}{" "}
        </div>
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          {" "}
          {suerveyIsPublished ? (
            <img src={imageUrls?.imageUrl} alt="icon" height={"15px"}></img>
          ) : (
            <div>
              <img
                src={imageUrls?.imageUrl}
                alt="icon"
                height={"15px"}
                onClick={() => handleSectionRemove(sectionLevel)}
                // onClick={() => handleSectionRemove(sectionLevel)}
              />
              <span className="remove-text">
                {languageConstants?.ExpressionBuilder_RemoveWIButton}
              </span>
            </div>
          )}
        </div>

        {_nestedRows &&
          _nestedRows?.length &&
          renderNestedConditions(
            _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
              ?.fields || []
          )}
      </div>
      {/* ) : (
        <div>
          <Space size="middle">
            <Spin />
          </Space>
        </div>
      )} */}
    </div>
  );
};

export default RowContainer;
