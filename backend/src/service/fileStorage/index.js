const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
const constant = require('@/config/constant');
const ServerError = require('@/utils/serverError');

exports.upload = async (filePath) => {
  const isFileExists = fs.existsSync(filePath);
  if (!isFileExists) throw new ServerError('NOT_FOUND', 'File not found');
  await fsp.rename(filePath, path.join(constant.fileStoragePath, path.basename(filePath)));
  return path.basename(filePath);
};

exports.saveFile = async (fileName) => {
  const existingFilePath = path.join(constant.tmpStoragePath, fileName);
  await this.upload(existingFilePath);
  return fileName;
};

exports.delete = async (filename) => {
  await fsp.unlink(path.join(constant.fileStoragePath, filename));
};

exports.replaceOldFile = async (oldFileName, newFileName) => {
  if (!newFileName) return newFileName;
  if (oldFileName === newFileName) return newFileName;
  await this.saveFile(newFileName);
  return newFileName;
};
