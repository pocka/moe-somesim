let fs=require('fs');

let meta=JSON.parse(fs.readFileSync(`${ __dirname }/../../package.json`));

export default meta;
