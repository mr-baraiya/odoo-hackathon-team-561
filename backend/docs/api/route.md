[Home](./../index.md)

# API Documentation

### Index

[Account](#account)  
[PG](#pg)  
[Room](#room)  
[Guest](#guest)  
[Booking](#booking)
[Expense](#expense)  
[Inquiry](#inquiry)  
[MonthlyPayment](#monthlypayment)  
[RoomLightBillHistory](#roomlightbillhistory)  
[User](#user)  
[Reminder](#reminder)  
[Country](#country)
[State](#state)
[City](#city)  
[Staff](#staff)

---

### Account

> `POST` [/api/account/verify-email](./components/account/verify.md)  
> `POST` [/api/account/register](./components/account/register.md)  
> `POST` [/api/account/login](./components/account/login.md)  
> `DELETE` [/api/account/logout](./components/account/logout.md)  
> `POST` [/api/account/change-password](./components/account/changePassword.md)  
> `POST` [/api/account/forgot-password](./components/account/forgotPassword.md)  
> `POST` [/api/account/reset-password](./components/account/resetPassword.md)

---

### PG

> `GET` [/api/pg](./components/pg/list.md)  
> `POST` [/api/pg](./components/pg/create.md)  
> `GET` [/api/pg/verify-code/`:code`](./components/pg/uniqueCode.md)  
> `GET` [api/pg/analytics](./components/pg/analytics.md)  
> `GET` [api/pg/`:pgId`](./components/pg/getProfile.md)  
> `PUT` [api/pg/`:pdId`](./components/pg/updateProfile.md)

---

### Room

> `POST` [/api/pg/`:pgId`/room](./components/room/create.md)  
> `GET` [/api/pg/`:pgId`/room](./components/room/list.md)  
> `GET` [/api/pg/`:pgId`/room/export](./components/room/exportData.md)  
> `GET` [/api/pg/`:pgId`/room/`:roomId`](./components/room/getOne.md)  
> `PUT` [/api/pg/`:pgId`/room/`:roomId`](./components/room/update.md)  
> `DELETE` [/api/pg/`:pgId`/room/`:roomId`](./components/room/delete.md)  
> `GET` [/api/pg/`:pgId`/room/`:roomId`/calculate-room-light-bill](./components/room/calculateRoomLightBill.md)

---

### Guest

> `GET` [/api/pg/`:pgId`/guest](./components/guest/list.md)  
> `POST` [/api/pg/`:pgId`/guest](./components/guest/create.md)  
> `GET` [/api/pg/`:pgId`/guest/filter/pending-monthly-payment](./components/guest/pendingGuestPayment.md)  
> `GET` [/api/pg/`:pgId`/guest/`:guestId`](./components/guest/getOne.md)  
> `PUT` [/api/pg/`:pgId`/guest/`:guestId`](./components/guest/update.md)  
> `DELETE` [/api/pg/`:pgId`/guest/`:guestId`](./components/guest/delete.md)  
> `POST` [/api/pg/`:pgId`/guest/`:guestId`/profile-image](./components/guest/updateProfileImage.md)  
> `DELETE` [/api/pg/`:pgId`/guest/`:guestId`/profile-image](./components/guest/deleteProfileImage.md)  
> `DELETE` [/api/pg/`:pgId`/guest/document/`:guestId`](./components/guest/deleteDocument.md)  
> `POST` [/api/pg/`:pgId`/guest/`:guestId`/document](./components/guest/uploadDocument.md)  
> `GET` [/api/pg/`:pgId`/guest/export-data](./components/guest/exportData.md)

---

### Booking

> `GET` [/api/pg/`:pgId`/booking](./components/booking/list.md)  
> `POST` [/api/pg/`:pgId`/booking](./components/booking/create.md)  
> `PUT` [/api/pg/`:pgId`/booking/`:bookingId`](./components/booking/update.md)  
> `DELETE` [/api/pg/`:pgId`/booking/`:bookingId`](./components/booking/delete.md)

---

### Expense

> `GET` [/api/pg/`:pgId`/expense](./components/expense/list.md)  
> `POST` [/api/pg/`:pgId`/expense](./components/expense/create.md)  
> `PUT` [/api/pg/`:pgId`/expense/`:expenseId`](./components/expense/update.md)  
> `DELETE` [/api/pg/`:pgId`/expense/`:expenseId`](./components/expense/delete.md)  
> `GET` [/api/pg/`:pgId`/expense/export-data](./components/expense/exportData.md)

---

### Inquiry

> `GET` [/api/pg/`:pgId`/inquiry](./components/inquiry/list.md)  
> `POST` [/api/pg/`:pgId`/inquiry](./components/inquiry/create.md)  
> `PUT` [/api/pg/`:pgId`/inquiry:`inquiryId`](./components/inquiry/update.md)  
> `DELETE` [/api/pg/`:pgId`/inquiry:`inquiryId`](./components/inquiry/delete.md)

---

### MonthlyPayment

> `POST` [/api/pg/`:pgId`/monthly-payment](./components/monthlyPayment/create.md)  
> `GET` [/api/pg/`:pgId`/monthly-payment?`guestId`](./components/monthlyPayment/list.md)  
> `PUT` [/api/pg/`:pgId`/monthly-payment/`:monthlyPaymentId`](./components/monthlyPayment/update.md)  
> `DELETE` [/api/pg/`:pgId`/monthly-payment/`:monthlyPaymentId`](./components/monthlyPayment/delete.md)  
> `GET` [/api/pg/`:pgId`/export-data](./components/monthlyPayment/exportData.md)

---

### RoomLightBillHistory

> `GET` [/api/pg/`:pgId`/room-light-bill-history](./components/roomLightBillHistory/list.md)  
> `POST` [/api/pg/`:pgId`/room-light-bill-history](./components/roomLightBillHistory/create.md)  
> `PUT` [/api/pg/`:pgId`/room-light-bill-history/`:lightBillId`](./components/roomLightBillHistory/update.md)  
> `DELETE` [/api/pg/`:pgId`/room-light-bill-history/`:lightBillId`](./components/roomLightBillHistory/delete.md)

---

### Reminder

> `GET` [/api/pg/`:pgId`/reminder](./components/reminder/list.md)  
> `POST` [/api/pg/`:pgId`/reminder/upsert](./components/reminder/upsert.md)

---

### User

> `GET` [/api/user](./components/user/list.md)  
> `GET` [/api/user/`:userId`](./components/user/getUserInfo.md)  
> `GET` [/api/user/permission](./components/user/permissionsForPg.md)  
> `POST` [/api/user](./components/user/create.md)  
> `POST` [/api/user/login/`:accountId`](./components/user/login.md)  
> `PUT` [/api/user/`:userId`](./components/user/update.md)  
> `DELETE` [/api/user/`:userId`](./components/user/delete.md)  
> `POST` [/api/user/`:userId`/permission](./components/user/updatePermission.md)  
> `DELETE` [/api/user/`:userId`/permission](./components/user/deletePermission.md)

---

### Staff

> `GET` [/api/pg/`:pgId`/staff](./components/staff/list.md)  
> `GET` [/api/pg/`:pgId`/staff/`:staffId`](./components/staff/getById.md)  
> `POST` [/api/pg/`:pgId`/staff](./components/staff/create.md)  
> `PUT` [/api/pg/`:pgId`/staff/`:staffId`](./components/staff/update.md)  
> `DELETE` [/api/pg/`:pgId`/staff/`:staffId`](./components/staff/delete.md)  
> `DELETE` [/api/pg/`:pgId`/staff/document/`:staffId`](./components/guest/deleteDocument.md)  
> `POST` [/api/pg/`:pgId`/staff/`:staffId`/document](./components/guest/uploadDocument.md)

---

### Access

> `GET` [/api/access/guest](./components/access/getGuestInfo.md)  
> `POST` [/api/access/guest/profile-image](./components/access/uploadProfile.md)  
> `DELETE` [/api/access/guest/document/`:documentId`](./components/access/deleteDocument.md)  
> `POST` [/api/access/guest/document](./components/access/uploadDocument.md)  
> `PUT` [/api/access/guest](./components/access/updateGuest.md)

---

### City

> `GET` [/api/city](./components/city/list.md)

### Country

> `GET` [/api/country](./components/country/list.md)

### State

> `GET` [/api/state](./components/state/list.md)
