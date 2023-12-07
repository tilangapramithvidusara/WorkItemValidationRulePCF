import React, { useEffect, useState } from "react";
import { Select } from "antd";
const { Option } = Select;

interface ListDropDownCommonProps {
  dropDownData: any;
  isDisabled: boolean;
  setFieldValue: any;
  changedId: any;
  fieldName: any;
  selectedValue: any;
  listDropDownData: any;
}

const ListDropDown: React.FC<ListDropDownCommonProps> = ({
  dropDownData,
  isDisabled,
  setFieldValue,
  changedId,
  fieldName,
  selectedValue,
  listDropDownData
}) => {
  const [dropDownValues, setDropDownValues] = useState<any>();
  // const [selectedValues, setSelectedValues] = useState<any>([]);

  // const [_selectedValue, _setSelectedValue] = useState<any>(null);

  useEffect(() => {
    if (listDropDownData && listDropDownData?.length) {
      setDropDownValues(
        listDropDownData?.filter(
          (item: { value: any }, index: any, self: any[]) =>
            index ===
            self?.findIndex((obj: { value: any }) => obj?.value === item?.value)
        )
      );
      // setSelectedValues(listDropDownData?.filter(
      //   (item: { value: any }, index: any, self: any[]) =>
      //     index ===
      //     self?.findIndex((obj: { value: any }) => obj?.value === item?.value)
      // ))
    }
  }, [listDropDownData]);

  const searchFilterSort = (optionA: any, optionB: any) => {
    return (optionA?.label ?? "")
      ?.toLowerCase()
      .localeCompare((optionB?.label ?? "")?.toLowerCase());
  };

  const searchFilterOption = (input: any, option: any) => {
    return (option?.label ?? "")?.toLowerCase()?.includes(input?.toLowerCase());
  };

  return (
    <div>
      {dropDownValues && dropDownValues.length > 0 && (
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
          value={selectedValue }
        />

        // <Select
        //   showSearch
        //   allowClear
        //   style={{ width: "100%" }}
        //   placeholder="Select Answer type"
        //   // value={selectedValues}
        //   onChange={(input, option) =>
        //     setFieldValue({ input: input, changedId, fieldName })
        //   }
        //   disabled={isDisabled ? isDisabled : false}
        //   // defaultValue={
        //   //   defaultMathematicalOperators?.length
        //   //     ? defaultMathematicalOperators
        //   //     : null
        //   // }
        //   options={dropDownValues}
        //   filterOption={searchFilterOption}
        //   filterSort={searchFilterSort}
        // >
        //   {selectedValues.map((value: any) => (
        //     <Option key={value} value={value}>
        //       {value}
        //     </Option>
        //   ))}
        // </Select>
      )}
    </div>
  );
};

export default ListDropDown;
