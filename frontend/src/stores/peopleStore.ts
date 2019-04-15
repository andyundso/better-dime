import { action, computed, observable } from 'mobx';
import { MainStore } from './mainStore';
import { AbstractStore } from './abstractStore';
import { Person, StoreEntitiyNames } from 'src/types';

export class PeopleStore extends AbstractStore<Person> {
  @observable
  public people: Person[] = [];
  @observable
  public person?: Person = undefined;

  protected get entityName(): StoreEntitiyNames {
    return {
      singular: 'Der Kunde',
      plural: 'Die Kunden',
    };
  }

  @computed
  public get entity(): Person | undefined {
    return this.person;
  }

  public set entity(person: Person | undefined) {
    this.person = person;
  }

  @computed
  get entities(): Person[] {
    return this.people;
  }

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  public filter = (p: Person) => {
    return [p.first_name, p.last_name, p.company ? p.company.name : ''].some(s => s.toLowerCase().includes(this.searchQuery));
  };

  protected async doDelete(id: number) {
    await this.mainStore.api.delete('/people/' + id);
    await this.doFetchAll();
  }

  protected async doDuplicate(id: number) {
    return this.mainStore.api.post<Person>('/people/' + id + '/duplicate');
  }

  @action
  public async doFetchAll() {
    const res = await this.mainStore.api.get<Person[]>('/people');
    this.people = res.data;
  }

  @action
  public async doFetchOne(id: number) {
    const res = await this.mainStore.api.get<Person>('/people/' + id);
    this.person = res.data;
  }

  @action
  public async doPost(person: Person) {
    const res = await this.mainStore.api.post('/people', person);
    this.person = res.data;
  }

  @action
  public async doPut(person: Person) {
    const res = await this.mainStore.api.put('/people/' + person.id, person);
    this.person = res.data;
  }
}
