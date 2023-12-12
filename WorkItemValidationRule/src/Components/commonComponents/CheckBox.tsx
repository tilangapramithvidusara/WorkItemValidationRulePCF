import React, { useEffect } from "react";
import { Checkbox, Col, Row } from "antd";
import type { CheckboxValueType } from "antd/es/checkbox/Group";

interface CheckBoxProps {
  checkboxDefaultSelectedValues: any;
  checkboxValuesFromConfig: any;
  setCheckboxValues: any;
  isDisabled: any
}

function CheckBox({
  checkboxDefaultSelectedValues,
  checkboxValuesFromConfig,
  setCheckboxValues,
  isDisabled
}: CheckBoxProps) {
    const checkboxOnChange = (checkedValues: any) => {
        console.log("CHECCCC", checkedValues);
        setCheckboxValues(checkedValues.map((item: string) => {
            return {
              [item]: {
                logicalName: item.toUpperCase(),
                value: item
              }
            };
          }))
    }
  useEffect(() => {
      console.log("checkboxDefaultSelectedValues", checkboxDefaultSelectedValues)
  }, [checkboxDefaultSelectedValues])
  return (
    <>
          <Checkbox.Group
            style={{ display: "block", marginBottom: "10px", textAlign: "left" }}
            // className="actionWrap"
            defaultValue={checkboxDefaultSelectedValues && checkboxDefaultSelectedValues?.length && checkboxDefaultSelectedValues}
            onChange={checkboxOnChange}
            options={checkboxValuesFromConfig}
            disabled={isDisabled}
          >
          </Checkbox.Group>
    </>
  );
}

export default CheckBox;
