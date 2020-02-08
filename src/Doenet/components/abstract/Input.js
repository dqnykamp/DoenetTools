import InlineComponent from './InlineComponent';

export default class Input extends InlineComponent {
  static componentType = "_input";

  static createPropertiesObject(args) {
    let properties = super.createPropertiesObject(args);
    properties.collaborateGroups = { default: undefined };
    return properties;
  }


  static returnStateVariableDefinitions() {

    let stateVariableDefinitions = {};

    stateVariableDefinitions.creditAchieved = {
      defaultValue: 0,
      public: true,
      componentType: "number",
      returnDependencies: () => ({}),
      definition: () => ({
        useEssentialOrDefaultValue: {
          creditAchieved: {
            variablesToCheck: ["creditAchieved"]
          }
        }
      }),
      inverseDefinition: function ({ desiredStateVariableValues }) {
        return {
          success: true,
          instructions: [{
            setStateVariable: "creditAchieved",
            value: desiredStateVariableValues.creditAchieved
          }]
        };
      }
    }

    stateVariableDefinitions.answerAncestor = {
      returnDependencies: () => ({
        answerAncestor: {
          dependencyType: "ancestorStateVariables",
          componentType: "answer",
          variableNames: ["delegateCheckWork", "justSubmitted"]
        }
      }),
      definition: function ({ dependencyValues }) {
        let answerAncestor = null;

        if (dependencyValues.answerAncestor.length === 1) {
          answerAncestor = dependencyValues.answerAncestor[0];
        }
        return {
          newValues: { answerAncestor }
        }
      }
    }


    stateVariableDefinitions.includeCheckWork = {
      returnDependencies: () => ({
        answerAncestor: {
          dependencyType: "stateVariable",
          variableName: "answerAncestor"
        },
      }),
      definition: function ({ dependencyValues }) {
        let includeCheckWork = false;
        if (dependencyValues.answerAncestor) {
          includeCheckWork = dependencyValues.answerAncestor.stateValues.delegateCheckWork;
        }
        return {
          newValues: { includeCheckWork }
        }
      }

    }


    stateVariableDefinitions.disabled = {
      returnDependencies: () => ({
        collaborateGroups: {
          dependencyType: "stateVariable",
          variableName: "collaborateGroups"
        },
        collaboration: {
          dependencyType: "flag",
          flagName: "collaboration"
        }
      }),
      definition: function ({ dependencyValues }) {
        let disabled = false;
        if (dependencyValues.collaborateGroups) {
          disabled = !dependencyValues.collaborateGroups.matchGroup(dependencyValues.collaboration)
        }
        return { newValues: { disabled } }
      }
    }


    stateVariableDefinitions.valueHasBeenValidated = {
      returnDependencies: () => ({
        answerAncestor: {
          dependencyType: "stateVariable",
          variableName: "answerAncestor"
        },
      }),
      definition: function ({ dependencyValues }) {

        let valueHasBeenValidated = false;

        if (dependencyValues.answerAncestor &&
          dependencyValues.answerAncestor.stateValues.justSubmitted) {
          valueHasBeenValidated = true;
        }
        return {
          newValues: { valueHasBeenValidated }
        }
      }
    }

    return stateVariableDefinitions;
  }
}
