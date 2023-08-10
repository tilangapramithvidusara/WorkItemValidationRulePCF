import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { DatePickerProps } from "antd";
import { DatePicker, Space } from "antd";
import moment from "moment";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;

const dateFormat = "YYYY-MM-DD";

interface DateTimeProps {
  isDisabled: boolean;
  changedId: any;
  fieldName: any;
  selectedValue: any;
  setFieldValue: any;
}

const DatePickerCustom: React.FC<DateTimeProps> = ({
  isDisabled,
  setFieldValue,
  changedId,
  fieldName,
  selectedValue,
}) => {
  const onChnageDate = (date: any, option: any) => {
    console.log("Date Changed", date);
    console.log("Date Changed option", option);

    setFieldValue({ input: option, changedId, fieldName });
  };
  useEffect(() => {
    setFieldValue({
      input:
        selectedValue && moment(selectedValue, dateFormat).isValid()
          ? dayjs(moment(selectedValue).format(dateFormat)).format(dateFormat)
          : dayjs(moment().format(dateFormat)).format(dateFormat),
      changedId,
      fieldName,
    });
  }, []);

  return (
    <Space direction="vertical" size={17}>
      <DatePicker
        defaultValue={
          selectedValue && moment(selectedValue, dateFormat).isValid()
            ? dayjs(moment(selectedValue, dateFormat).format(dateFormat))
            : dayjs(moment().format(dateFormat))
        }
        format={dateFormat}
        disabled={isDisabled}
        onChange={(input, option) => onChnageDate(input, option)}
        style={{ width: 200 }}
      />
    </Space>
  );
};

export default DatePickerCustom;
