import * as yup from 'yup';
import { localizeSchema } from '../../utilities/validation';

export const projectWorkTypeSchema = localizeSchema(() =>
  yup.object({
    name: yup.string().required(),
  })
);

export const projectWorkTypeTemplate = {
  name: '',
};
