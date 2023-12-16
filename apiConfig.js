
const fs = require('fs');
const yaml = require('js-yaml');
const tools = require('./tools');

const productsFile = './config/products.yaml';
const generalFile = './config/general.yaml';


// Function to read a YAML file and convert it to JSON
function readYamlFileJson(filePath = productsFile) {
    try {
        const yamlContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = yaml.load(yamlContent);
        return jsonData;
    } catch (error) {
        console.error(`Error reading YAML file: ${error.message}`);
        return null;
    }
}

// Function to convert JSON to YAML and save it to a file
function saveJsonAsYaml(jsonData,filePath = productsFile) {
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
  saveJsonAsYaml
};

//const txyFile = './config/txy.yaml';
const ctxyFile = './config/txyc.txt';

//config.clientConfig = readYamlFileJson(txyFile);
//tools.cryptoJson.saveToFile(config.clientConfig,ctxyFile);
config.clientConfig  = tools.cryptoJson.readFromFile(ctxyFile);
//console.log(config.clientConfig);


config.general = readYamlFileJson(generalFile)||{};
config.products = readYamlFileJson(productsFile)||[];
config.saveProducts = function(pts){
  config.products = pts;
  saveJsonAsYaml(pts,productsFile);
}
config.readYamlFileJson = readYamlFileJson;
config.saveJsonAsYaml = saveJsonAsYaml;

config.saveGeneral = function(data){
  config.general = data;
  saveJsonAsYaml(data,generalFile);
}


module.exports =  config;
