import { observable } from 'mobx';
import { Project } from '../types';
import { MainStore } from './mainStore';
import { AbstractStore } from './abstractStore';

export interface ProjectListing {
  id: number;
  name: string;
  shortDescription: string;
}

export class ProjectStore extends AbstractStore<Project, ProjectListing> {
  protected get entityName(): { singular: string; plural: string } {
    return {
      singular: 'Das Projekt',
      plural: 'Die Projekte',
    };
  }

  get entities(): Array<ProjectListing> {
    return this.projects;
  }

  @observable
  public projects: ProjectListing[] = [];
  @observable
  public project?: Project = undefined;

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  protected async doFetchAll(): Promise<void> {
    const res = await this.mainStore.api.get<ProjectListing[]>('/projects');
    this.projects = res.data;
  }

  protected async doFetchOne(id: number) {
    const res = await this.mainStore.api.get<Project>('/projects/' + id);
    this.project = res.data;
  }

  protected async doPost(entity: Project): Promise<void> {
    const res = await this.mainStore.api.post<Project>('/projects/', this.cast(entity));
    this.project = res.data;
  }

  protected async doPut(entity: Project): Promise<void> {
    const res = await this.mainStore.api.put<Project>('/projects/' + entity.id, this.cast(entity));
    this.project = res.data;
  }

  protected cast(project: Project) {
    //this prevents empty fields being sent to the backend as ""
    //optimally, this can be handled in the form so empty strings don't even reach here.
    return {
      ...project,
      fixed_price: project.fixed_price || null,
      deadline: project.deadline || null,
    };
  }
}
