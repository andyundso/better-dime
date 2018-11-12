import * as React from 'react';
import { ReactNode } from 'react';
import { ErrorMessage, FieldProps } from 'formik';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input/Input';
import Switch from '@material-ui/core/Switch/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import { PropTypes } from '@material-ui/core';

/**
 * This component tries to improve Formik performance by delaying the onChange call until the input field is blurred.
 * Formik's <FastField> is supposed to do this already, but it seemed to be syncing onChange anyway. This _might_ introduce some issues
 * like the value of the last input of the form not being synced back into formik on hitting enter to submit the form.
 */
class DelayedInput extends React.Component<any> {
  state = {
    value: '',
  };

  constructor(props: any) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  public handleChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ value: e.target.value });

  public handleBlur = this.props.onChange;

  public render = () => {
    return <Input {...this.props} value={this.state.value} onChange={this.handleChange} onBlur={this.handleBlur} />;
  };
}

export type FormProps = { label: string; children: ReactNode; fullWidth: boolean; margin?: PropTypes.Margin } & FieldProps;
export type InputFieldProps = { type: string; unit?: string; onChange?: any; value?: any } & FormProps;

export const ValidatedFormGroupWithLabel = ({
  label,
  field,
  form: { touched, errors },
  children,
  fullWidth,
  margin = 'normal',
}: FormProps) => {
  const hasErrors: boolean = !!errors[field.name] && !!touched[field.name];

  return (
    <FormControl margin={margin} error={hasErrors} fullWidth={fullWidth}>
      {label && <InputLabel htmlFor={field.name}>{label}</InputLabel>}
      {children}
      <ErrorMessage name={field.name} render={error => <FormHelperText error={true}>{error}</FormHelperText>} />
    </FormControl>
  );
};

export const InputFieldWithValidation = ({ label, field, form, fullWidth = false, unit = undefined, margin, ...rest }: InputFieldProps) => (
  <ValidatedFormGroupWithLabel label={label} field={field} form={form} fullWidth={fullWidth} margin={margin}>
    <DelayedInput
      fullWidth={fullWidth}
      endAdornment={unit ? <InputAdornment position={'end'}>{unit}</InputAdornment> : undefined}
      {...field}
      {...rest}
    />
  </ValidatedFormGroupWithLabel>
);

export const SwitchField = ({ label, field }: FormProps) => (
  <FormControlLabel control={<Switch checked={field.value} {...field} />} label={label} />
);

export const EmailField = (props: InputFieldProps) => <InputFieldWithValidation type={'email'} {...props} />;

export const NumberField = (props: InputFieldProps) => <InputFieldWithValidation type={'number'} {...props} />;

export const PasswordField = (props: InputFieldProps) => <InputFieldWithValidation type={'password'} {...props} />;

export const TextField = (props: InputFieldProps & { multiline?: boolean }) => <InputFieldWithValidation type={'text'} {...props} />;

export const TodoField = (props: InputFieldProps) => {
  console.warn('TodoField used! Implement a custom field type for this.');
  return <TextField {...props} />;
};
