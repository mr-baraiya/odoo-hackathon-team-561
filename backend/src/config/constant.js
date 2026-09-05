const path = require('path');
const fs = require('fs');
const errorCodes = require('./errorCode');

const fileStoragePath = path.join(__dirname, '../../files');
const whatsappCachePath = path.join(__dirname, '../../whatsapp_cache');
const tmpStoragePath = path.join(__dirname, '../../tmp');
const metaStorageFilePath = path.join(__dirname, '../../meta.json');

if (!fs.existsSync(fileStoragePath)) fs.mkdirSync(fileStoragePath);
if (!fs.existsSync(whatsappCachePath)) fs.mkdirSync(whatsappCachePath);
if (!fs.existsSync(tmpStoragePath)) fs.mkdirSync(tmpStoragePath);
if (!fs.existsSync(metaStorageFilePath)) fs.writeFileSync(metaStorageFilePath, JSON.stringify({}));

module.exports = {
  fileStoragePath,
  whatsappCachePath,
  tmpStoragePath,
  metaStorageFilePath,

  user: {
    token: {
      expiryInSeconds: 86400,
    },
  },

  errorCodes,

  stateGstinCodes: [
    { code: '01', state: 'Jammu and Kashmir', is_union_territory: true },
    { code: '02', state: 'Himachal Pradesh', is_union_territory: false },
    { code: '03', state: 'Punjab', is_union_territory: false },
    { code: '04', state: 'Chandigarh', is_union_territory: true },
    { code: '05', state: 'Uttarakhand', is_union_territory: false },
    { code: '06', state: 'Haryana', is_union_territory: false },
    { code: '07', state: 'Delhi', is_union_territory: true },
    { code: '08', state: 'Rajasthan', is_union_territory: false },
    { code: '09', state: 'Uttar Pradesh', is_union_territory: false },
    { code: '10', state: 'Bihar', is_union_territory: false },
    { code: '11', state: 'Sikkim', is_union_territory: false },
    { code: '12', state: 'Arunachal Pradesh', is_union_territory: false },
    { code: '13', state: 'Nagaland', is_union_territory: false },
    { code: '14', state: 'Manipur', is_union_territory: false },
    { code: '15', state: 'Mizoram', is_union_territory: false },
    { code: '16', state: 'Tripura', is_union_territory: false },
    { code: '17', state: 'Meghalaya', is_union_territory: false },
    { code: '18', state: 'Assam', is_union_territory: false },
    { code: '19', state: 'West Bengal', is_union_territory: false },
    { code: '20', state: 'Jharkhand', is_union_territory: false },
    { code: '21', state: 'Odisha', is_union_territory: false },
    { code: '22', state: 'Chhattisgarh', is_union_territory: false },
    { code: '23', state: 'Madhya Pradesh', is_union_territory: false },
    { code: '24', state: 'Gujarat', is_union_territory: false },
    { code: '25', state: 'Daman and Diu', is_union_territory: true },
    { code: '26', state: 'Dadra and Nagar Haveli', is_union_territory: true },
    { code: '27', state: 'Maharashtra', is_union_territory: false },
    { code: '29', state: 'Karnataka', is_union_territory: false },
    { code: '30', state: 'Goa', is_union_territory: false },
    { code: '31', state: 'Lakshadweep', is_union_territory: true },
    { code: '32', state: 'Kerala', is_union_territory: false },
    { code: '33', state: 'Tamil Nadu', is_union_territory: false },
    { code: '34', state: 'Puducherry', is_union_territory: true },
    { code: '35', state: 'Andaman and Nicobar', is_union_territory: true },
    { code: '36', state: 'Telangana', is_union_territory: false },
    { code: '37', state: 'Andhra Pradesh', is_union_territory: false },
    { code: '38', state: 'Ladakh', is_union_territory: true },
    { code: '97', state: 'Other territory', is_union_territory: false },
    { code: '96', state: 'Other country99', is_union_territory: false },
    { code: '99', state: 'Centre jurisdiction', is_union_territory: false },
  ],
};
