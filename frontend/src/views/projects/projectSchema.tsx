import * as yup from 'yup';
import { dimeDate, localizeSchema, nullableNumber, requiredNumber, selector, titleRegex } from '../../utilities/validation';

export const projectSchema = localizeSchema(() => {
  const regex = titleRegex();
  const errorMessage = 'Projekttitel muss folgendes Format haben: Gemeinde, Flurname, Arbeiten, Jahreszahl. Beispiel: \n' +
    'Dübendorf, Chriesbach, Initialpflege, 2019';

  return yup.object({
      name: yup.string().matches(regex, regexData => {
        return errorMessage;
      }).required(),
      accountant_id: selector(),
      address_id: selector(),
      customer_id: selector(),
      description: yup.string().required(),
      chargeable: yup.boolean(),
      archived: yup.boolean(),
      deadline: dimeDate().nullable(true),
      category_id: yup.number().nullable(true).required('Es muss eine Kategorie angegeben werden'),
      rate_group_id: selector(),
      fixed_price: nullableNumber(),
      positions: yup.array(
        yup.object({
          description: yup.string().nullable(true),
          price_per_rate: requiredNumber(),
          rate_unit_id: selector(),
          vat: requiredNumber(),
        }),
      ),
      costgroup_distributions: yup
        .array(
          yup.object({
            costgroup_number: requiredNumber(),
            weight: requiredNumber().min(1, 'Das Gewicht einer Kostenstelle muss grösser als 0 sein.'),
          }),
        )
        .min(1, 'Ein Projekt benötigt mindestens eine zugewiesene Kostenstelle.'),
    });
  },
);

export const projectTemplate = () => ({
  id: undefined,
  name: '',
  description: '',
  deadline: '',
  fixed_price: '',
  position_groupings: [],
  positions: [],
  category_id: undefined,
  customer_id: undefined,
  address_id: undefined,
  rate_group_id: undefined,
  costgroup_distributions: [],
});
