import { computed, observable } from 'mobx';
import { MainStore } from './mainStore';
import { AbstractStore } from './abstractStore';
import { Service } from '../types';
import { ServiceListing } from '../types';

export class ServiceStore extends AbstractStore<Service, ServiceListing> {
  protected get entityName() {
    return {
      singular: 'Der Service',
      plural: 'Die Services',
    };
  }

  @computed
  public get entity(): Service | undefined {
    return this.service;
  }

  public set entity(service: Service | undefined) {
    this.service = service;
  }

  @computed
  public get entities() {
    return this.services;
  }

  @observable
  public services: ServiceListing[] = [];
  @observable
  public service?: Service = undefined;

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  public filter = (s: ServiceListing) =>
    [`${s.id}`, s.name, s.description || ''].some(field => field.toLowerCase().includes(this.searchQuery));

  protected async doArchive(id: number, archived: boolean) {
    await this.mainStore.api.put('/services/' + id + '/archive', { archived });
    this.doFetchAll();
  }

  protected async doDuplicate(id: number) {
    return this.mainStore.api.post<Service>('/services/' + id + '/duplicate');
  }

  protected async doFetchAll() {
    const res = await this.mainStore.api.get<ServiceListing[]>('/services');
    this.services = res.data;
  }

  protected async doFetchOne(id: number) {
    const res = await this.mainStore.api.get<Service>('/services/' + id);
    this.service = res.data;
    return res.data;
  }

  protected async doPost(entity: Service): Promise<void> {
    const res = await this.mainStore.api.post('/services', entity);
    this.service = res.data;
  }

  protected async doPut(entity: Service): Promise<void> {
    const res = await this.mainStore.api.put(`/services/${entity.id}`, entity);
    this.service = res.data;
  }

  public getName(id: number) {
    const service = this.services.find(s => s.id === id);
    return service ? service.name : id;
  }
}
