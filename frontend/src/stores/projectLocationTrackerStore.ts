import { AbstractStore } from './abstractStore';
import { ProjectLocationTracker, ProjectEffortFilter, StoreEntitiyNames } from '../types';
import { action, computed, observable } from 'mobx';
import moment from 'moment';
import { MainStore } from './mainStore';
import { apiDateFormat } from './apiStore';

export class ProjectLocationTrackerStore extends AbstractStore<ProjectLocationTracker> {
  protected get entityName(): StoreEntitiyNames {
    return {
      singular: 'die Projektteilarbeit',
      plural: 'die Projektteilarbeiten',
    };
  }

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  @observable
  public editing: boolean = false;

  @observable
  public projectLocationTrackerTemplate: ProjectLocationTracker = {
    date: moment(),
    project_id: undefined,
    project_location_id: undefined,
    project_work_type_id: undefined,
  };

  @observable
  public projectLocationTrackers: ProjectLocationTracker[] = [];

  @observable
  public projectLocationTracker?: ProjectLocationTracker;

  @computed
  get entities(): Array<ProjectLocationTracker> {
    return this.projectLocationTrackers;
  }

  @computed
  get entity(): ProjectLocationTracker | undefined {
    return this.projectLocationTracker;
  }

  set entity(projectLocationTracker: ProjectLocationTracker | undefined) {
    this.projectLocationTracker = projectLocationTracker;
  }

  @action
  public async fetchFiltered(filter: ProjectEffortFilter) {
    try {
      const res = await this.mainStore.api.get<ProjectLocationTracker[]>('/project_location_trackers', {
        params: {
          start: filter.start.format(apiDateFormat),
          end: filter.end.format(apiDateFormat),
        },
      });
      this.projectLocationTrackers = res.data;
    } catch (e) {
      this.mainStore.displayError('Fehler beim laden der Projektteilarbeiten');
    }
  }

  @action
  protected async doFetchOne(id: number) {
    const res = await this.mainStore.api.get<ProjectLocationTracker>('/project_location_trackers/' + id);
    this.projectLocationTracker = res.data;
  }

  @action
  protected async doPost(entity: ProjectLocationTracker): Promise<void> {
    const res = await this.mainStore.api.post<ProjectLocationTracker>('/project_location_trackers', entity);
    this.projectLocationTracker = res.data;
  }

  @action
  protected async doPut(entity: ProjectLocationTracker): Promise<void> {
    const res = await this.mainStore.api.put<ProjectLocationTracker>('/project_location_trackers/' + entity.id, entity);
    this.projectLocationTracker = res.data;
  }

  @action
  protected async doDelete(id: number): Promise<void> {
    await this.mainStore.api.delete('/project_location_trackers/' + id);
  }
}
