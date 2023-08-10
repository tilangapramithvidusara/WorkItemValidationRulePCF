import React, { useEffect, useState } from "react";
import { Select } from "antd";

interface ListDropDownCommonProps {
  dropDownData: any;
  isDisabled: boolean;
  setFieldValue: any;
  changedId: any;
  fieldName: any;
  selectedValue: any;
  listDropDownData: any
  // getDropDownData: any; // Define the getDropDownData prop
  // answerCallback: any; 
}

const ListDropDown: React.FC<ListDropDownCommonProps> = ({ dropDownData, isDisabled, setFieldValue, changedId, fieldName, selectedValue, listDropDownData }) => {
  useEffect(() => {
      console.log("listDropDownData", listDropDownData)
  }, [listDropDownData])
  return (
    <div>
      <Select
        showSearch
        style={{ width: 200 }}
        placeholder="Search to Select"
        optionFilterProp="children"
        options={listDropDownData && listDropDownData?.length ? listDropDownData : []}
        disabled={isDisabled ? isDisabled : false}
        onChange={(input, option) => setFieldValue({ input: input, changedId, fieldName })}
        defaultValue={selectedValue}
      />
    </div>
  );
};

export default ListDropDown;
