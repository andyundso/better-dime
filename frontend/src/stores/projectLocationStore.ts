import { AbstractStore } from './abstractStore';
import { ProjectLocation, StoreEntitiyNames } from '../types';
import { action, computed, observable } from 'mobx';
import { MainStore } from './mainStore';

export class ProjectLocationStore extends AbstractStore<ProjectLocation> {
  protected get entityName(): StoreEntitiyNames {
    return {
      singular: 'das Projektgebiet',
      plural: 'die Projektgebiete',
    };
  }

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  @observable
  public editing: boolean = false;

  @observable
  public projectLocationTemplate: ProjectLocation = {
    name: '',
  };

  @observable
  public projectLocations: ProjectLocation[] = [];

  @observable
  public projectLocation?: ProjectLocation;

  @computed
  get entities(): Array<ProjectLocation> {
    return this.projectLocations;
  }

  @computed
  get entity(): ProjectLocation | undefined {
    return this.projectLocation;
  }

  set entity(projectLocation: ProjectLocation | undefined) {
    this.projectLocation = projectLocation;
  }

  @action
  protected async doFetchOne(id: number) {
    const res = await this.mainStore.api.get<ProjectLocation>('/project_locations/' + id);
    this.projectLocation = res.data;
  }

  @action
  protected async doFetchAll() {
    const res = await this.mainStore.api.get<ProjectLocation[]>('/project_locations');
    this.projectLocations = res.data;
  }

  @action
  protected async doPost(entity: ProjectLocation): Promise<void> {
    const res = await this.mainStore.api.post<ProjectLocation>('/project_locations', entity);
    this.projectLocation = res.data;
    await this.doFetchAll();
  }

  @action
  protected async doPut(entity: ProjectLocation): Promise<void> {
    const res = await this.mainStore.api.put<ProjectLocation>('/project_locations/' + entity.id, entity);
    this.projectLocation = res.data;
    await this.doFetchAll();
  }

  @action
  protected async doDelete(id: number): Promise<void> {
    await this.mainStore.api.delete('/project_locations/' + id);
    await this.doFetchAll();
  }
}
