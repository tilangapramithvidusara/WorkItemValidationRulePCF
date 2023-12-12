import React from 'react';
import { Select } from 'antd';
import sampleInputQuestion from '../../SampleData/sampleInputQuestion';

interface SearchSortProps {
    sampleData: any[]; // Adjust the type/interface as needed
    selectedValue: any,
    overrideSearch: boolean,
    setFieldValue: any,
    changedId: any,
    fieldName: any
    isDisabled: any
}
  
const FieldInput: React.FC<SearchSortProps> = ({sampleData, selectedValue, overrideSearch, setFieldValue, changedId, fieldName, isDisabled}) => {

    const searchFilterSort = (optionA: any, optionB: any) => {
        return (optionA?.value ?? '')?.toLowerCase().localeCompare((optionB?.value ?? '')?.toLowerCase());
    }

    const searchFilterOption = (input: any, option: any) => {
        return (option?.value ?? '')?.toLowerCase()?.includes(input?.toLowerCase())
    }
    
    const onChangeSearchEvent = (input: any, option: any) => {
        setFieldValue({input, changedId, fieldName})
    }
    return (
        <div>
            <Select
                showSearch={overrideSearch ? overrideSearch : true}
                style={{ width: 200 }}
                placeholder="Search to Select"
                optionFilterProp="children"
                filterOption={searchFilterOption}
                filterSort={searchFilterSort}
                onChange={onChangeSearchEvent}
                options={sampleData}
                defaultValue={selectedValue}
                disabled={isDisabled}
            />
        </div>
    )
}

export default FieldInput;