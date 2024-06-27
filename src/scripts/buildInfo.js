import { writeFileSync } from 'fs';
import { resolve } from 'path';

const main = () => {
  const date = new Date();

  const obj = {
    date: `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
  };

  const filePath = resolve('src', 'autogenerated', 'buildInfo.json');
  const fileContents = JSON.stringify(obj, null, 2);

  writeFileSync(filePath, fileContents);
};

main();
