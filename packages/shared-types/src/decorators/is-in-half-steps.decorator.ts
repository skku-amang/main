import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsInHalfSteps(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "IsInHalfSteps",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === "number" && value % 0.5 === 0; // you can return a Promise<boolean> here as well, if you want to make async validation
        },
        defaultMessage(args: ValidationArguments) {
          return (
            args.constraints?.[0] ||
            `${args.property} must be in half-step increments (e.g., 0.5, 1, 1.5)`
          );
        },
      },
    });
  };
}
