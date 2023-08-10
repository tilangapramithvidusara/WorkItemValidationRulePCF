import React, { useEffect, useState } from 'react';
import { InputNumber } from 'antd';

interface NumberInputField {
    selectedValue: any;
    handleNumberChange: any;
    defaultDisabled: any;
    setInputNumber: any;
    changedId: any;
  fieldName: any;
  validatingSuccess: any
}

const FieldInput: React.FC<NumberInputField> = ({
    selectedValue,
    handleNumberChange,
    defaultDisabled,
    setInputNumber,
    changedId,
  fieldName,
  validatingSuccess
}) => {

  const numberFormatter = (value: number | undefined) => {
    if (value) {
      return String(value).replace(/[^0-9]/g, ''); // Remove non-numeric characters
    }
    return '';
  };

  const numberParser = (displayValue: string | undefined): number => {
    if (displayValue) {
      const parsedValue = parseInt(displayValue, 10);
      if (!isNaN(parsedValue)) {
        return parsedValue;
      }
    }
    return NaN; // Return a default value if the parsing fails
  };

  return (
    <div>
      <InputNumber
        formatter={numberFormatter}
        parser={numberParser}
        disabled={defaultDisabled ? defaultDisabled : false}
        style={{ width: "100%" }}
        onChange={(value) => setInputNumber({ input: value, changedId, fieldName })}
        value={selectedValue}
        status={!validatingSuccess ? "error" : "" }
      />
    </div>
  );
};

export default FieldInput;
