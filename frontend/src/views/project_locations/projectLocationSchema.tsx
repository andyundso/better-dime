import * as yup from 'yup';
import { localizeSchema } from '../../utilities/validation';

export const projectLocationSchema = localizeSchema(() =>
  yup.object({
    name: yup.string().required(),
  })
);

export const projectLocationTemplate = {
  name: '',
};
