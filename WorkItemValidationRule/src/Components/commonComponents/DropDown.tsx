import React, { useEffect, useState } from "react";
import { Select } from "antd";

interface DropDownCommonProps {
  dropDownData: any[];
  isDisabled: boolean;
  setExpression: any;
  changedId: any;
  fieldName: any;
  selectedValue: any;
}

const DropDown: React.FC<DropDownCommonProps> = ({ dropDownData, isDisabled, setExpression, changedId, fieldName, selectedValue }) => {

  useEffect(() => {
    console.log("selectedValue === 'con'", selectedValue)
  }, [selectedValue])

  const onChangeEvent = (option: any) => {
    setExpression({ input: option.value, changedId, fieldName })
    // if(selectedValue === 'con') setExpression({ input: "" , changedId, fieldName: "value" })
  }

  useEffect(() => {
    console.log("fieldNamefieldName", fieldName)
  }, [fieldName])
  return (
    <div>

<Select
        showSearch
        style={fieldName === 'expression' ? { width: '100px' } : fieldName === 'condition' ? { width: '150px' } :  { width: '150px' }}
        placeholder="Search to Select"
        optionFilterProp="children"
        filterOption={(input, option) => (option?.label ?? "").includes(input)}
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? "")
            .toLowerCase()
            .localeCompare((optionB?.label ?? "").toLowerCase())
        }
        options={dropDownData}
        disabled={isDisabled ? isDisabled : false}
        onChange={(input, option) => onChangeEvent(option)}
        value={selectedValue}
      />
    </div>
  );
};

export default DropDown;
