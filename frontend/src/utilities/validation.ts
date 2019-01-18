import * as yup from 'yup';
import { Schema, setLocale } from 'yup';
import moment from 'moment';
import { apiDateFormat } from '../stores/apiStore';

export const requiredMessage = 'Dies ist ein erforderliches Feld.';

const initializeLocalization = () =>
  setLocale({
    mixed: {
      required: requiredMessage,
      typeError: requiredMessage,
    },
    number: {
      required: requiredMessage,
      typeError: requiredMessage,
    },
  });

/**
 * setLocale changes the global state of yup and the order in which files are evaluated is not predictable. By wrapping
 * the creation of every schema in this function, we make sure setLocale has been called before creating the schema.
 */
export const localizeSchema = <T>(creator: () => Schema<T>) => {
  initializeLocalization();
  return creator();
};

export const nullableNumber = () =>
  yup
    .mixed()
    .transform(value => (value === '' || value === null ? null : Number(value)))
    .nullable(true);

export const dimeDate = () =>
  yup.mixed().transform(value => {
    return value ? moment(value).format(apiDateFormat) : null;
  });

export const requiredNumber = () =>
  yup
    .number()
    .required()
    .typeError(requiredMessage);
export const selector = requiredNumber;