import * as React from 'react';
import { InputFieldProps } from './common';
import { TransformingField } from './TransformingField';

const factor = 100;
const toString = (n: number) => (n * factor).toFixed(2);
const toValue = (s: string) => Number(s) / factor;

const PercentageField = (props: InputFieldProps) => (
  <TransformingField {...props} toString={toString} toValue={toValue} type={'number'} unit={'%'} />
);
export default PercentageField;
