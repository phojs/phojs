class PhoError extends Error {}
class InvalidFieldNameError extends PhoError {}
class InvalidTypeNameError extends PhoError {}
class MissingDependencyError extends PhoError {}

class MissingRequiredFieldError extends PhoError {}
class InvalidChoiceSelectedError extends PhoError {}
class FieldValidationError extends PhoError {}

class ExcludedFieldError extends PhoError {}
class DependencyCycleError extends PhoError {}
class DuplicateDefinitionError extends PhoError {}

class InvalidFieldTypeError extends PhoError {}

module.exports = {
  InvalidFieldNameError,
  InvalidTypeNameError,
  MissingDependencyError,
  MissingRequiredFieldError,
  InvalidChoiceSelectedError,
  ExcludedFieldError,
  DependencyCycleError,
  DuplicateDefinitionError,
  InvalidFieldTypeError,
  FieldValidationError,
}
