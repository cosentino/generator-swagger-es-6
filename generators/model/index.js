'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const yaml = require('js-yaml');
const fs = require('fs');

module.exports = class extends Generator {
  prompting() {
    this.log(yosay(
      'Welcome to the primo model ' + chalk.red('generator-swagger-es-6') + ' generator!'
    ));

    // Load the swagger.yaml file, convert it to json and look for the definition section
    var swaggerDefinitions = [];
    var swaggerDefinitionsNames = [];
    try {
      const ymlFile = fs.readFileSync('src/api/swagger/swagger.yaml', 'utf8');
      const swaggerDoc = yaml.safeLoad(ymlFile);      
      swaggerDefinitions = swaggerDoc.definitions;
      for(var key in swaggerDefinitions) {
        if(swaggerDefinitions.hasOwnProperty(key)) {
          swaggerDefinitionsNames.push(key);
        }
      }      
    } catch (e) {      
      console.error('An error occurred parsing the swagger.yaml file', e);
    }

    const prompts = [{
      type: 'input',
      name: 'name',
      message: 'Your new model name!'
    }];

    if (swaggerDefinitionsNames && swaggerDefinitionsNames.length > 0) {
      (function() {
        prompts.push({
          type: 'list',
          name: 'definition',
          message: 'The swagger definition you want to generate the mongoose schema from? ',
          choices: swaggerDefinitionsNames,
          default: function(userAnswers) {
            return swaggerDefinitionsNames.indexOf(userAnswers.name);
          }
        });
      })();
    }

    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('model.js'),
      this.destinationPath(`src/models/${this.props.name}.js`), {
        name: this.props.name
      }
    );
    this.fs.copyTpl(
      this.templatePath('test.js'),
      this.destinationPath(`src/test/models/${this.props.name}.js`), {
        name: this.props.name
      }
    );
  }
};
