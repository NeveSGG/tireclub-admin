import * as Yup from 'yup';
import { IIntrospectFields } from 'types/types';
import { slugify } from 'transliteration';

type IObject = {
  [name: string]: any;
};

export function truncateString(str: string): string {
  if (str.length <= 20) {
    return str;
  }

  return `${str.slice(0, 20)}...`;
}

export function randomPercent(factor?: number): number {
  let randomNumber = 0;
  if (factor) {
    randomNumber = Math.floor(Math.random() * factor);
  } else {
    randomNumber = Math.floor(Math.random() * 101);
  }

  return randomNumber;
}

export const reorder = <T>(
  list: Array<T>,
  startIndex: number,
  endIndex: number
): Array<T> => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export function createValidationSchema(
  fieldsToShow: IIntrospectFields
): Yup.ObjectSchema<
  {
    [x: string]: unknown;
  },
  Yup.AnyObject,
  {
    [x: string]: unknown;
  },
  ''
> {
  const schemaObject: any = {};

  Object.keys(fieldsToShow).forEach((fieldName) => {
    const { type, label, required, show } = fieldsToShow[fieldName];

    if (show) {
      switch (type) {
        case 'string': {
          schemaObject[fieldName] = Yup.string().typeError(
            `"${label}" должно быть строкой`
          );
          break;
        }
        case 'number': {
          schemaObject[fieldName] = Yup.number().typeError(
            `"${label}" должно быть числом`
          );
          break;
        }
        case 'text': {
          schemaObject[fieldName] = Yup.string().typeError(
            `"${label}" должно быть строкой`
          );
          break;
        }
        case 'integer': {
          schemaObject[fieldName] = Yup.number()
            .typeError(`"${label}" должно быть целым числом`)
            .integer(`${label} должно быть целым числом`);
          break;
        }
        case 'float': {
          schemaObject[fieldName] = Yup.number().typeError(
            `"${label}" должно быть числом`
          );
          break;
        }
        case 'boolean': {
          schemaObject[fieldName] = Yup.boolean().oneOf([true, false]);
          break;
        }
        case 'decimal': {
          schemaObject[fieldName] = Yup.number().typeError(
            `"${label}" должно быть числом`
          );
          break;
        }
        default: {
          schemaObject[fieldName] = Yup.mixed();
        }
      }

      if (fieldName.includes('_id')) {
        schemaObject[fieldName] = Yup.mixed();
      }

      // if (fieldName.includes('applicable')) {
      //   schemaObject[fieldName] = Yup.mixed();
      // }

      if (fieldName.includes('_enum')) {
        schemaObject[fieldName] = Yup.mixed();
      }

      if (required) {
        schemaObject[fieldName] = schemaObject[fieldName].required(
          'Поле обязательно для заполнения'
        );
      } else {
        schemaObject[fieldName] = schemaObject[fieldName].nullable();
      }
    }
  });

  return Yup.object().shape(schemaObject);
}

export function createSlug(obj: IObject): string {
  return slugify(
    obj.title || obj.name || obj.value || obj.city || obj.rating || obj.id
  );
}

export function truncateStringMidle(str: string): string {
  const firstPart = str.slice(0, 10);
  const lastPart = str.slice(-5);
  return `${firstPart}...${lastPart}`;
}

export function isObject(param: unknown): boolean {
  return typeof param === 'object' && param !== null && !Array.isArray(param);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getResourceName(item: any): string {
  return (
    item.name ||
    item.value ||
    item.title ||
    item.subtitle ||
    item.city ||
    item.id
  );
}

export function makeClassificationLabel(instanceOrList: any[] | any): string {
  if (Array.isArray(instanceOrList)) {
    return instanceOrList
      .map((instance: any) => getResourceName(instance))
      .join(', ');
  }
  return getResourceName(instanceOrList);
}
