import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import { Button, Checkbox, Switch } from "antd";
import RowContainer from "./rowContainer";
import CheckBox from "../Components/commonComponents/CheckBox";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import NumberInputField from "../Components/commonComponents/NumberInputField";
import sampleInputQuestion from "../SampleData/sampleInputQuestion";
import { updateAllLevelActionsArray } from "../Utils/utilsHelper";
import { loadAllQuestionsInSurvey } from "../XRMRequests/xrmRequests";
interface NestedRowProps {
  children: React.ReactNode;
}

interface Row {
  level: number;
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  column5: string;
  column6: string;
  innerConditions: any;
}

interface SectionProps {
  sectionLevel: number;
  conditionData: any;
  setConditionData: any;
  _setNestedRows: any;
  _nestedRows: any;
  isNested: any;
  currentPossitionDetails: any;
  questionList: any;
  setValidation: any;
  setDeleteSectionKey: any;
  imageUrls: any;
  suerveyIsPublished: any
}

function SectionContainer({
  sectionLevel,
  conditionData,
  setConditionData,
  _setNestedRows,
  _nestedRows,
  isNested,
  currentPossitionDetails,
  questionList,
  setValidation,
  setDeleteSectionKey,
  imageUrls,
  suerveyIsPublished
}: SectionProps) {
  const [rowData, setRowData] = useState<any>();
  const [rows, setRows] = useState<Row[]>([
    {
      level: 1,
      column1: "",
      column2: "",
      column3: "",
      column4: "",
      column5: "",
      column6: "",
      innerConditions: "",
    },
  ]);
  const addRow = () => {
    setRows(
      (prevRows) =>
        [
          ...prevRows,
          {
            level: "",
            column1: "",
            column2: "",
            column3: "",
            column4: "",
            column5: "",
            column6: "",
            innerConditions: "",
          },
        ] as Row[]
    );
  };

  const handleSectionRemove = () => {
      setDeleteSectionKey(sectionLevel)
  }

  useEffect(() => {
    let releatedFields = _nestedRows?.find((x: { [x: string]: any; }) => x[sectionLevel]);
    if (releatedFields && sectionLevel && releatedFields[sectionLevel] && currentPossitionDetails) {
      let releatedActions = releatedFields[sectionLevel]?.actions
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            checkBoxValues: releatedActions.map((x: any) => x?.checkBoxValues)[0],
            minMax: releatedActions.map((x: { minMax: any; }) => x?.minMax)[0] || {}
          }
        ])
      );
    }
  }, []);

  return (
    <div>
      {rows && rows.length && rows.map((row, index) => (
        <RowContainer
          rowIndex={index}
          rowData={rowData}
          setRowData={setRowData}
          addRow={addRow}
          isNested={isNested}
          sectionLevel={sectionLevel}
          setConditionData={setConditionData}
          _setNestedRows={_setNestedRows}
          _nestedRows={_nestedRows}
          questionList={questionList}
          handleSectionRemove={handleSectionRemove}
          imageUrls={imageUrls}
          suerveyIsPublished={suerveyIsPublished}
        />
      ))}
    </div>
  );
}
export default SectionContainer;
