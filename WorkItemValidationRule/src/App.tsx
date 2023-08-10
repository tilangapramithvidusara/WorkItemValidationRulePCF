import React from 'react'
import ParentComponent from './Features/index';
interface MyComponentProps {
  imageUrl: any;
  imageUrl1: any;
  imageUrl2: any;
}
const  App: React.FC<MyComponentProps> = ({ imageUrl, imageUrl1, imageUrl2 }) => {
  return (
    <>
      <ParentComponent
        imageUrl={imageUrl}
        imageUrl1={imageUrl1}
        imageUrl2={imageUrl2}
      />
    </>
  )
}
export default App;