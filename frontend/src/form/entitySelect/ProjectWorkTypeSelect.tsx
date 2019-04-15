import * as React from 'react';
import { inject, observer } from 'mobx-react';
import compose from '../../utilities/compose';
import Select, { DimeSelectFieldProps } from '../fields/Select';
import { ProjectWorkTypeStore } from '../../stores/projectWorkTypeStore';

interface Props<T = number> extends DimeSelectFieldProps<T> {
  projectWorkTypeStore?: ProjectWorkTypeStore;
}

@compose(
  inject('projectWorkTypeStore'),
  observer
)
export class ProjectWorkTypeSelect<T> extends React.Component<Props<T>> {
  constructor(props: Props<T>) {
    super(props);
    this.props.projectWorkTypeStore!.fetchAll();
  }

  public get options() {
    return this.props.projectWorkTypeStore!.projectWorkTypes.map(e => ({
      value: e.id,
      label: `${e.id} ${e.name}`,
    }));
  }

  public render() {
    return <Select options={this.options} {...this.props} />;
  }
}
