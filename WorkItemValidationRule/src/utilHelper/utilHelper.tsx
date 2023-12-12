

const utilHelper = (updatedRowArray: any[], _reverseArrayWithFilledValues: any[], sectionKey: any) => {
    const matchedArray: any[] = [];

    // for (const comparedItem of updatedRowArray) {
    //   const { sectionKey, Row } = comparedItem;
    
      const matchedSampleItems = _reverseArrayWithFilledValues.filter((sampleItem: { index: any; }) => sampleItem.index === sectionKey);
      console.log("EEEEEESSDDDD", matchedSampleItems)

      matchedSampleItems.forEach((x: { blocks: { if: { conditions: any; }; }[]; }) => {
        const matchedRecord = x.blocks[0].if.conditions;
        matchedArray.push(...matchedRecord);
      });
    // }
    
    const mergedArray = [...matchedArray];
    console.log("EEEEEE", mergedArray)
    for (const comparedItem of updatedRowArray) {
      const matchingObject = matchedArray.find((item) => item.Row === comparedItem.Row);
      if (!matchingObject) {
        mergedArray.push(comparedItem);
      }
    }
    console.log("EEEEEE 1", mergedArray)

    mergedArray.forEach((x) => {
        updatedRowArray.forEach((y: { Row: any; Expression: any; Field: any; Value: any; sectionKey: any; Operator: any }) => {
        if (x.Row === y.Row) {
          x.Expression = y.Expression ? y.Expression : '';
          x.Field = y.Field ? y.Field : '';
            x.Operator = y.Operator ? y.Value : '';
            x.sectionKey = y.sectionKey
        }
      });
    });
    console.log("EEEEEE 2", mergedArray)

    return mergedArray
};

export default utilHelper;