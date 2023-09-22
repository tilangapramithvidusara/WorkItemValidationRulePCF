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
  const [dropDownValues, setDropDownValues] = useState<any>();

  
  useEffect(() => {
    console.log("listDropDownData", listDropDownData)
    if (listDropDownData && listDropDownData?.length) {
      setDropDownValues(listDropDownData?.filter((item: { value: any; }, index: any, self: any[]) =>
      index === self?.findIndex((obj: { value: any; }) => obj?.value === item?.value)
    ))
    }
  }, [listDropDownData]);

  const searchFilterSort = (optionA: any, optionB: any) => {
    console.log("List orppPPPP", optionA, optionB);
    return (optionA?.label ?? '')?.toLowerCase().localeCompare((optionB?.label ?? '')?.toLowerCase());
}

const searchFilterOption = (input: any, option: any) => {
    console.log(" List orppPP option", input, option);
    return (option?.label ?? '')?.toLowerCase()?.includes(input?.toLowerCase())
}
  
  return (
    <div>
      { dropDownValues && dropDownValues.length > 0 &&
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Search to Select"
          optionFilterProp="children"
          options={dropDownValues}
          disabled={isDisabled ? isDisabled : false}
          onChange={(input, option) => setFieldValue({ input: input, changedId, fieldName })}
          defaultValue={selectedValue}
          filterOption={searchFilterOption}
          filterSort={searchFilterSort}
        />
      }
    </div>
  );
};

export default ListDropDown;
