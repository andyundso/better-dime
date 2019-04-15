import { AbstractStore } from './abstractStore';
import { ProjectWorkType, StoreEntitiyNames } from '../types';
import { action, computed, observable } from 'mobx';
import { MainStore } from './mainStore';

export class ProjectWorkTypeStore extends AbstractStore<ProjectWorkType> {
  protected get entityName(): StoreEntitiyNames {
    return {
      singular: 'die Projektarbeit',
      plural: 'die Projektarbeiten',
    };
  }

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  @observable
  public editing: boolean = false;

  @observable
  public ProjectWorkTypeTemplate: ProjectWorkType = {
    name: '',
  };

  @observable
  public projectWorkTypes: ProjectWorkType[] = [];

  @observable
  public projectWorkType?: ProjectWorkType;

  @computed
  get entities(): Array<ProjectWorkType> {
    return this.projectWorkTypes;
  }

  @computed
  get entity(): ProjectWorkType | undefined {
    return this.projectWorkType;
  }

  set entity(projectWorkType: ProjectWorkType | undefined) {
    if (projectWorkType) {
      this.projectWorkType = projectWorkType;
    }
  }

  @action
  protected async doFetchOne(id: number) {
    const res = await this.mainStore.api.get<ProjectWorkType>('/project_work_types/' + id);
    this.projectWorkType = res.data;
  }

  @action
  protected async doFetchAll() {
    const res = await this.mainStore.api.get<ProjectWorkType[]>('/project_work_types');
    this.projectWorkTypes = res.data;
  }

  @action
  protected async doPost(entity: ProjectWorkType): Promise<void> {
    const res = await this.mainStore.api.post<ProjectWorkType>('/project_work_types', entity);
    this.projectWorkType = res.data;
    await this.doFetchAll();
  }

  @action
  protected async doPut(entity: ProjectWorkType): Promise<void> {
    const res = await this.mainStore.api.put<ProjectWorkType>('/project_work_types/' + entity.id, entity);
    this.projectWorkType = res.data;
    await this.doFetchAll();
  }

  @action
  protected async doDelete(id: number): Promise<void> {
    await this.mainStore.api.delete('/project_work_types/' + id);
    await this.doFetchAll();
  }
}
