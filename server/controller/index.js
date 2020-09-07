'use strict';
const fse = require('fs-extra');
const path = require('path');

// Retrieve all files in directory
const getAllFiles = (dir, allFiles) => {
    allFiles = allFiles || [];
    const dirFiles = fse.readdirSync(dir);
  
    dirFiles.forEach((dirFile) => {
      const currentDir = path.join(dir, dirFile);
      fse.statSync(currentDir).isDirectory(dir)
        ? allFiles = getAllFiles(currentDir, allFiles)
        : allFiles.push(currentDir);
    });
  
    return allFiles;
};

const shuffleArray = (arr) => {
    let length = arr.length;

    while (--length > 0) {
      const rand = Math.floor(Math.random() * (length + 1));
      const temp = arr[rand];
      arr[rand] = arr[length];
      arr[length] = temp;
    }
    return arr;
};

const avatarController = () => {
    const allFiles = getAllFiles(path.join(process.cwd(), '/client/src/assets/avatars'));
    return shuffleArray(allFiles);
}

module.exports = {
    avatarController,
};
