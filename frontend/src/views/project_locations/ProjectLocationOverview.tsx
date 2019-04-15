import * as React from 'react';
import { MainStore } from '../../stores/mainStore';
import compose from '../../utilities/compose';
import { inject, observer } from 'mobx-react';
import { Column } from '../../layout/Overview';
import { EditableOverview } from '../../layout/EditableOverview';
import { TextField } from '../../form/fields/common';
import { ProjectLocationStore } from '../../stores/projectLocationStore';
import { projectLocationSchema, projectLocationTemplate } from './projectLocationSchema';
import { ProjectLocation } from '../../types';
import { DimeField } from '../../form/fields/formik';

interface Props {
  mainStore?: MainStore;
  projectLocationStore?: ProjectLocationStore;
}

@compose(
  inject('mainStore', 'projectLocationStore'),
  observer
)
export default class ProjectLocationOverview extends React.Component<Props> {
  public columns: Array<Column<ProjectLocation>> = [];

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
    const projectLocationStore = this.props.projectLocationStore;

    return (
      <EditableOverview
        archivable
        searchable
        title={'Projektgebiete'}
        store={projectLocationStore!}
        columns={this.columns}
        schema={projectLocationSchema}
        defaultValues={projectLocationTemplate}
        renderForm={() => (
          <>
            <DimeField component={TextField} name={'name'} label={'Name'} />
          </>
        )}
      />
    );
  }
}
