export class PhoError extends Error {}
export class InvalidFieldNameError extends PhoError {}
export class InvalidTypeNameError extends PhoError {}
export class MissingDependencyError extends PhoError {}

export class MissingRequiredFieldError extends PhoError {}
export class InvalidChoiceSelectedError extends PhoError {}
export class FieldValidationError extends PhoError {}

export class ExcludedFieldError extends PhoError {}
export class DependencyCycleError extends PhoError {}
export class CategoryIsFieldError extends PhoError {}

export class InvalidFieldTypeError extends PhoError {}