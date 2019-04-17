import { action, computed, observable } from 'mobx';
import { Costgroup } from '../types';
import { AbstractStore } from './abstractStore';
import { MainStore } from './mainStore';

export class CostgroupStore extends AbstractStore<Costgroup> {
  protected get entityName() {
    return {
      singular: 'Die Kostenstelle',
      plural: 'Die Kostenstellen',
    };
  }

  @computed
  get entities() {
    return this.costgroups;
  }

  @observable
  costgroups: Costgroup[] = [];

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  protected async doFetchAll() {
    const res = await this.mainStore.api.get<Costgroup[]>('/costgroups');
    this.costgroups = res.data;
  }
}
