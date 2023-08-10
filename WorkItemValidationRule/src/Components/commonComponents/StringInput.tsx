import React from 'react';
import { Input, Select } from 'antd';
import sampleInputQuestion from '../../SampleData/sampleInputQuestion';

interface FieldStringInputProps {
    sampleData: any[]; // Adjust the type/interface as needed
    selectedValue: any,
    overrideSearch: boolean,
    setFieldValue: any,
    changedId: any,
    fieldName: any,
    isDisabled: any
}
  
const FieldStringInput: React.FC<FieldStringInputProps> = ({sampleData, selectedValue, overrideSearch, setFieldValue, changedId, fieldName, isDisabled}) => {

    const searchFilterSort = (optionA: any, optionB: any) => {
        return (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase());
    }
        
    
    const searchFilterOption = (input: any, option: any) => {
        return (option?.label ?? '').includes(input)
    }
    
    const onChangeSearchEvent = (e: any) => {
        console.log("input", e)
        setFieldValue({input: e?.target?.value, changedId, fieldName})
    }
    return (
        <div>
            <Input
                style={{ width: 200 }}
                placeholder="Search to Select"
                onChange={onChangeSearchEvent}
                defaultValue={selectedValue}
                disabled={isDisabled}
            />
        </div>
    )
}

export default FieldStringInput;