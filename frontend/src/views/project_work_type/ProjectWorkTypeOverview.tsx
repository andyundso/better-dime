import * as React from 'react';
import { MainStore } from '../../stores/mainStore';
import compose from '../../utilities/compose';
import { inject, observer } from 'mobx-react';
import { Column } from '../../layout/Overview';
import { EditableOverview } from '../../layout/EditableOverview';
import { TextField } from '../../form/fields/common';
import { ProjectWorkTypeStore } from '../../stores/projectWorkTypeStore';
import { projectWorkTypeSchema, projectWorkTypeTemplate } from './projectWorkTypeSchema';
import { ProjectWorkType } from '../../types';
import { DimeField } from '../../form/fields/formik';

interface Props {
  mainStore?: MainStore;
  projectWorkTypeStore?: ProjectWorkTypeStore;
}

@compose(
  inject('mainStore', 'projectWorkTypeStore'),
  observer
)
export default class ProjectWorkTypeOverview extends React.Component<Props> {
  public columns: Array<Column<ProjectWorkType>> = [];

  public constructor(props: Props) {
    super(props);
    this.columns = [
      {
        id: 'id',
        numeric: false,
        label: 'ID',
      },
      {
        id: 'name',
        numeric: false,
        label: 'Name',
      },
    ];
  }

  public render() {
    const projectWorkTypeStore = this.props.projectWorkTypeStore;

    return (
      <EditableOverview
        archivable
        searchable
        title={'Projektarbeiten'}
        store={projectWorkTypeStore!}
        columns={this.columns}
        schema={projectWorkTypeSchema}
        defaultValues={projectWorkTypeTemplate}
        renderForm={() => (
          <>
            <DimeField component={TextField} name={'name'} label={'Name'} />
          </>
        )}
      />
    );
  }
}
