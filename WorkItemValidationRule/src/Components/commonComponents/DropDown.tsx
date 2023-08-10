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
[
  {
      "and": [
          {
              "==": [
                  {
                      "var": "NTemp_C01_s01_grd"
                  },
                  123
              ]
          },
          {
              "==": [
                  {
                      "var": "NTemp_C01_s01_grd"
                  },
                  22
              ]
          },
          {
              "and": [
                  {
                      "==": [
                          {
                              "var": "NTemp_C2_S1_Q1"
                          },
                          " 224"
                      ]
                  }
              ]
          }
      ]
  }
]
const DropDown: React.FC<DropDownCommonProps> = ({ dropDownData, isDisabled, setExpression, changedId, fieldName, selectedValue }) => {
  return (
    <div>
      <Select
        showSearch
        style={{ width: 200 }}
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
        onChange={(input, option) => setExpression({ input: option.value, changedId, fieldName })}
        value={selectedValue}
      />
    </div>
  );
};

export default DropDown;
