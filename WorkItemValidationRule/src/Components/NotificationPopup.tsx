// import React, { useEffect } from 'react';
// import { Button, notification, Space } from 'antd';

// type NotificationType = 'success' | 'info' | 'warning' | 'error';

// interface NumberInputField {
//     notificationType: any;
//     notificationContent: any;
//     isSaveSuccess: any
// }

// const NotificationPopup: React.FC<NumberInputField> = ({notificationType, notificationContent, isSaveSuccess}) => {
//   const [api, contextHolder] : any = notification.useNotification();

//     const openNotificationWithIcon = (notificationType: any) => {
//         const { title, description} = notificationContent
//         api[notificationType]({
//             message: title,
//           description: description,
//         });
//       };
    
//     useEffect(() => {
//         if (isSaveSuccess) {
//            openNotificationWithIcon(notificationType)
//         }
// }, [isSaveSuccess])
    
//   return (
//     <>
//       {contextHolder}
//       <Space>
//         {notificationContent}
//         {/* <Button onClick={() => openNotificationWithIcon('info')}>Info</Button>
//         <Button onClick={() => openNotificationWithIcon('warning')}>Warning</Button>
//         <Button onClick={() => openNotificationWithIcon('error')}>Error</Button> */}
//       </Space>
//     </>
//   );
// };

// export default NotificationPopup;