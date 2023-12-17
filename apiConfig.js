
const fs = require('fs');
const yaml = require('js-yaml');
const tools = require('./tools');
const path = require('path');


// Function to read a YAML file and convert it to JSON
function readYamlFileJson(filePath ) {
    try {
        const yamlContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = yaml.load(yamlContent);
        console.log(`JSON read   from ${filePath}`);
        return jsonData;
    } catch (error) {
        console.error(`Error reading YAML file: ${error.message}`);
        return null;
    }
}

// Function to convert JSON to YAML and save it to a file
function saveJsonAsYaml(jsonData,filePath ) {
    try {
        const yamlContent = yaml.dump(jsonData);
        fs.writeFileSync(filePath, yamlContent, 'utf8');
        console.log(`JSON converted to YAML and saved to ${filePath}`);
    } catch (error) {
        console.error(`Error saving YAML file: ${error.message}`);
    }
}





const config = {
  readYamlFileJson,
  saveJsonAsYaml,
  saveDir:path.join(__dirname,'config'),
};


config.getClientConfig = function(){
  if(config.clientConfig) {
    return config.clientConfig;
  }
  const ctxyFile = path.join(__dirname,'config','txyc.txt');
  return config.clientConfig  = tools.cryptoJson.readFromFile(ctxyFile);
}


config.saveProducts = function(pts){
  config.products = pts;
  const filePath = path.join(config.saveDir,'products.yaml');
  saveJsonAsYaml(pts,filePath);
}

config.getProducts = function(){
  if(config.products) {
    return config.products;
  }
  const filePath = path.join(config.saveDir,'products.yaml');
  return config.products=readYamlFileJson(filePath)||[];
}

config.getGeneral = function(){
  if(config.general) {
    return config.general;
  }
  const filePath = path.join(config.saveDir,'general.yaml');
  return config.general=readYamlFileJson(filePath)||{};
}

config.saveGeneral = function(data){
  config.general = data;
  const filePath = path.join(config.saveDir,'general.yaml');
  saveJsonAsYaml(data,filePath);
}


module.exports =  config;
//console.log('apiConfig: getClientConfig',config.getClientConfig());
