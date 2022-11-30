const process = require("process");
const { FieldLogic } = require("./field-logic");
const { MissingDependencyError } = require("./errors");
const { FieldType } = require("./field-type");
const {
  required,
  oneOf,
  dependsOn,
  excludeFields,
  typeValidation,
  deprecated,

  greaterThanOrEqualTo,
  greaterThan,
  lowerThanOrEqualTo,
  lowerThan,
} = require("./validation-functions");

const rootLogger = require("./root-logger");

class Field {
  constructor(phoContext, name, fullPath, type, description, defaultValue) {
    this.name = name;
    this.fullPath = fullPath;
    this.type = type;
    this.description = description;
    this.defaultValue = defaultValue;
    this.phoContext = phoContext;
    this.log = rootLogger.extend("Field");

    this.modifiers = [];
    this.validators = [];

    // assume we are a child of root which means we don't depend on any other field
    // to be validated/modified
    this.phoContext.dependencyGraph.addEdge("__root", this.fullPath);
    this.addTypeValidation();
  }

  addTypeValidation() {
    if (!this.type) {
      return;
    }

    if (this.type instanceof FieldType) {
      this.addValidator(this.type);
      return;
    }

    this.addValidator(
      new FieldLogic("type validation", typeValidation, this.type)
    );
  }

  /*
   * @param fieldLogic - FieldLogic object
   */
  handleDependencies(fieldLogic) {
    this.log.extend("handleDependencies")(fieldLogic);
    if (fieldLogic.dependsOn.length > 0) {
      this.log("Unlinking from root");
      this.phoContext.dependencyGraph.removeEdge("__root", this.fullPath); //
    }

    fieldLogic.dependsOn.forEach((field) => {
      this.log("Linking", field, "=>", this.fullPath);
      this.phoContext.dependencyGraph.addEdge(field, this.fullPath);
    });
  }

  addValidator(validator) {
    this.validators.push(validator);
    this.handleDependencies(validator);
  }

  addModifier(modifier) {
    this.modifiers.push(modifier);
    this.handleDependencies(modifier);
  }

  getDependencyValues(fieldLogic) {
    let dependantFieldValues = [];
    for (const dependencyName of fieldLogic.dependsOn) {
      const depValue = this.phoContext.getFieldValue(dependencyName);
      if (fieldLogic.dependenciesRequired && depValue === undefined) {
        throw new MissingDependencyError(
          `FieldLogic ${fieldLogic.name} is missing a dependant value: ${dependencyName}`
        );
      }
      dependantFieldValues.push(depValue);
    }
    return dependantFieldValues;
  }

  parse(value) {
    const parserLog = this.log.extend("parser");
    parserLog(this.fullPath, "parsing", value, "default =", this.defaultValue);

    let current = value ?? this.defaultValue ?? value;
    for (const modifier of this.modifiers) {
      parserLog(this.fullPath, "running modifier", modifier.name);
      const dependantFieldValues = this.getDependencyValues(modifier);
      current = modifier.run(this, current, ...dependantFieldValues);
      parserLog(this.fullPath, "new current =", current);
    }

    for (const validator of this.validators) {
      parserLog(this.fullPath, 'running validation "', validator.name, '"');
      const dependantFieldValues = this.getDependencyValues(validator);
      validator.run(this, current, ...dependantFieldValues);
    }

    return current;
  }

  validate(name, validateFunc, dependsOn = [], args = []) {
    this.addValidator(new FieldLogic(name, validateFunc, args, dependsOn));
    return this;
  }

  modify(name, validateFunc, dependsOn = [], args = []) {
    this.addModifier(new FieldLogic(name, validateFunc, args, dependsOn));
    return this;
  }

  /**
   * This field can only be defined if the given fields are also defined.
   * @param fieldNames - varargs of all the fields that should exist
   */
  dependsOn(...fieldNames) {
    this.validate("dependsOn", dependsOn, fieldNames, fieldNames);
    return this;
  }

  /**
   * Sets whether this field is required.
   * @param isRequired - should the field be required or not.
   */
  required(isRequired = true) {
    this.validate("required", required, [], isRequired);
    return this;
  }

  /**
   * The field's value can only be one of the given choices.
   * @param choices - the field's supported values
   */
  oneOf(...choices) {
    this.validate("oneOf", oneOf, [], choices);
    return this;
  }

  /*
   * This field cannot be defined together with the fields given
   * @param fields - fields that this field excludes.
   */
  excludes(...fields) {
    this.validate("excludeFields", excludeFields, fields, fields);
    return this;
  }

  /*
   * Outputs a deprecation warning using console.error when a deprecated field is used
   * @param - an alternative field name to mention for the user to use instead of deprecated one
   */
  deprecated({ alternativeFieldName = null, output = console.error } = {}) {
    this.validate("deprecated", deprecated, [], {
      alternativeFieldName,
      output,
    });
    return this;
  }

  lowerThanOrEqualTo(inclusiveUpperBound) {
    let args = [];
    const dependencies = [];
    if (typeof inclusiveUpperBound === "string") {
      dependencies.push(inclusiveUpperBound);
    } else {
      args = inclusiveUpperBound;
    }
    this.validate(
      `lowerThanOrEqualTo ${inclusiveUpperBound}`,
      lowerThanOrEqualTo,
      dependencies,
      args
    );
    return this;
  }

  lowerThan(exclusiveUpperBound) {
    let args = [];
    const dependencies = [];
    if (typeof exclusiveUpperBound === "string") {
      dependencies.push(exclusiveUpperBound);
    } else {
      args = exclusiveUpperBound;
    }
    this.validate(
      `lowerThan ${exclusiveUpperBound}`,
      lowerThan,
      dependencies,
      args
    );
    return this;
  }

  greaterThanOrEqualTo(inclusiveLowerBound) {
    let args = [];
    const dependencies = [];
    if (typeof inclusiveLowerBound === "string") {
      dependencies.push(inclusiveLowerBound);
    } else {
      args = inclusiveLowerBound;
    }
    this.validate(
      `lowerThanOrEqualTo ${inclusiveLowerBound}`,
      greaterThanOrEqualTo,
      dependencies,
      args
    );
    return this;
  }

  greaterThan(exclusiveLowerBound) {
    let args = [];
    const dependencies = [];
    if (typeof exclusiveLowerBound === "string") {
      dependencies.push(exclusiveLowerBound);
    } else {
      args = exclusiveLowerBound;
    }
    this.validate(
      `greaterThan ${exclusiveLowerBound}`,
      greaterThan,
      dependencies,
      args
    );
    return this;
  }

  /*
   * The field needs to be between the given bounds [...)
   * @param {number} inclusiveLowerBound - the inclusive lower bound
   * @param {number} exclusiveUpperBound - the exclusive upper bound
   */
  inRangeOf(inclusiveLowerBound, exclusiveUpperBound) {
    this.greaterThanOrEqualTo(inclusiveLowerBound);
    this.lowerThan(exclusiveUpperBound);
    return this;
  }

  fromEnv(envVarName) {
    this.modify(`load from ENV ${envVarName}`, (field, value) => {
      // if value is not given, override it with the value from the env var
      const envValue = process.env[envVarName];
      if (value !== undefined || envValue === undefined) {
        return value;
      }
      switch (field.type) {
        case "integer":
          return parseInt(envValue);
        case "number":
          return parseFloat(envValue);
        default:
          return envValue;
      }
    });
    return this;
  }
}

module.exports = {
  Field,
};
