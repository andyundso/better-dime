import { action } from 'mobx';
import { MainStore } from './mainStore';

/**
 * This class wraps all common store functions with success/error popups. The desired methods that start with "do" should be overriden in the specific stores.
 */
export class AbstractStore<T, OverviewType = T> {
  constructor(protected mainStore: MainStore) {}

  protected get entityName() {
    return { singular: 'Die Entität', plural: 'Die Entitäten' };
  }

  public get entity(): T | undefined {
    throw new Error('Not implemented');
  }

  public set entity(e: T | undefined) {
    throw new Error('Not implemented');
  }

  public get entities(): Array<OverviewType> {
    throw new Error('Not implemented');
  }

  private displayInProgress() {
    this.mainStore.displayInfo('In Arbeit...', { autoHideDuration: 60000 });
  }

  @action
  public async fetchAll() {
    try {
      await this.doFetchAll();
    } catch (e) {
      this.mainStore.displayError(`${this.entityName.plural} konnten nicht geladen werden.`);
      console.error(e);
      throw e;
    }
  }

  protected async doFetchAll() {
    throw new Error('Not implemented');
  }

  @action
  public async fetchOne(id: number) {
    try {
      await this.doFetchOne(id);
    } catch (e) {
      this.mainStore.displayError(`${this.entityName.plural} konnten nicht geladen werden.`);
      console.error(e);
      throw e;
    }
  }

  protected async doFetchOne(id: number) {
    throw new Error('Not implemented');
  }

  @action
  public async post(entity: T) {
    try {
      this.displayInProgress();
      await this.doPost(entity);
      this.mainStore.displaySuccess(`${this.entityName.singular} wurde gespeichert.`);
    } catch (e) {
      this.mainStore.displayError(`${this.entityName.singular} konnte nicht gespeichert werden.`);
      console.error(e);
      throw e;
    }
  }

  protected async doPost(entity: T) {
    throw new Error('Not implemented');
  }

  @action
  public async put(entity: T) {
    try {
      this.displayInProgress();
      await this.doPut(entity);
      this.mainStore.displaySuccess(`${this.entityName.singular} wurde gespeichert.`);
    } catch (e) {
      this.mainStore.displayError(`${this.entityName.singular} konnte nicht gespeichert werden.`);
      console.error(e);
      throw e;
    }
  }

  @action
  protected async doPut(entity: T) {
    throw new Error('Not implemented');
  }

  @action
  public async delete(id: number) {
    try {
      this.displayInProgress();
      await this.doDelete(id);
      this.mainStore.displaySuccess(`${this.entityName.singular} wurde gelöscht.`);
    } catch (e) {
      this.mainStore.displayError(`${this.entityName.singular} konnte nicht gelöscht werden.`);
      console.error(e);
      throw e;
    }
  }

  @action
  protected async doDelete(id: number) {
    throw new Error('Not implemented');
  }
}