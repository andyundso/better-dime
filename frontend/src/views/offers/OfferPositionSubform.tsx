import * as React from 'react';
import { Field, FieldArray, FormikProps } from 'formik';
import { NumberFieldWithValidation } from '../../form/fields/common';
import TableBody from '@material-ui/core/TableBody/TableBody';
import TableCell from '@material-ui/core/TableCell/TableCell';
import Table from '@material-ui/core/Table/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableRow from '@material-ui/core/TableRow/TableRow';
import { observer } from 'mobx-react';
import compose from '../../utilities/compose';
import { Offer, OfferPosition } from '../../types';
import { ServiceSelector } from '../../form/entitySelector/ServiceSelector';
import { MainStore } from '../../stores/mainStore';
import { DeleteButton } from '../../layout/ConfirmationDialog';
import TableToolbar from '../../layout/TableToolbar';
import PercentageField from '../../form/fields/PercentageField';
import { RateUnitSelector } from '../../form/entitySelector/RateUnitSelector';
import CurrencyField from '../../form/fields/CurrencyField';

const template = {
  amount: '',
  order: 1,
  price_per_rate: '',
  rate_unit_id: '',
  vat: 0.077, // this should probably be configurable somewhere; user settings?
};

export interface Props {
  mainStore?: MainStore;
  formikProps: FormikProps<Offer>;
  name: string;
}

@compose(observer)
export default class OfferPositionSubform extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const { values } = this.props.formikProps;
    return (
      <FieldArray
        name={this.props.name}
        render={arrayHelpers => (
          <>
            <TableToolbar title={'Services'} numSelected={0} addAction={() => arrayHelpers.push(template)} />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reihenfolge</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Tarif</TableCell>
                  <TableCell>Tariftyp</TableCell>
                  <TableCell>Menge</TableCell>
                  <TableCell>MwSt.</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {values.positions.map((p: OfferPosition, index: number) => {
                  const name = (fieldName: string) => `${this.props.name}.${index}.${fieldName}`;
                  const total = p.amount * p.price_per_rate * (1 + p.vat);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Field component={NumberFieldWithValidation} name={`positions.${index}.order`} />
                      </TableCell>
                      <TableCell>
                        <Field component={ServiceSelector} name={name('service_id')} />
                      </TableCell>
                      <TableCell>
                        <Field component={CurrencyField} name={name('price_per_rate')} />
                      </TableCell>
                      <TableCell>
                        <Field component={RateUnitSelector} name={name('rate_unit_id')} />
                      </TableCell>
                      <TableCell>
                        <Field component={NumberFieldWithValidation} name={name('amount')} />
                      </TableCell>
                      <TableCell>
                        <Field component={PercentageField} name={name('vat')} />
                      </TableCell>
                      <TableCell>{this.props.mainStore!.formatCurrency(total)}</TableCell>
                      <TableCell>
                        <DeleteButton onConfirm={() => arrayHelpers.remove(index)} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      />
    );
  }
}
