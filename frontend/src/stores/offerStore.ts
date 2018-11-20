import { observable } from 'mobx';
import { Invoice, Offer, Project } from '../types';
import { MainStore } from './mainStore';
import { AbstractStore } from './abstractStore';

export interface OfferListing {
  id: number;
  name: string;
  shortDescription: string;
}

export class OfferStore extends AbstractStore<Offer, OfferListing> {
  protected get entityName(): { singular: string; plural: string } {
    return {
      singular: 'die Offerte',
      plural: 'die Offerten',
    };
  }

  get entities(): Array<OfferListing> {
    return this.offers;
  }

  @observable
  public offers: OfferListing[] = [];
  @observable
  public offer?: Offer = undefined;

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  protected async doFetchAll(): Promise<void> {
    const res = await this.mainStore.api.get<OfferListing[]>('/offers');
    this.offers = res.data;
  }

  protected async doFetchOne(id: number) {
    this.offer = undefined;
    const res = await this.mainStore.api.get<Offer>('/offers/' + id);
    this.offer = res.data;
  }

  protected async doPost(entity: Offer): Promise<void> {
    const res = await this.mainStore.api.post<Offer>('/offers/', this.cast(entity));
    this.offer = res.data;
  }

  protected async doPut(entity: Offer): Promise<void> {
    const res = await this.mainStore.api.put<Offer>('/offers/' + entity.id, this.cast(entity));
    this.offer = res.data;
  }

  public async createProject(id: number): Promise<Project> {
    try {
      this.displayInProgress();
      const res = await this.mainStore.api.post<Project>(`/offers/${id}/create_project`);
      this.mainStore.displaySuccess('Das Projekt wurde erstellt');
      return res.data;
    } catch (e) {
      this.mainStore.displayError('Beim erstellen des Projekts ist ein Fehler aufgetreten');
      throw e;
    }
  }

  public async createInvoice(id: number): Promise<Invoice> {
    try {
      this.displayInProgress();
      const res = await this.mainStore.api.post<Invoice>(`/offers/${id}/create_invoice`);
      this.mainStore.displaySuccess('Die Rechnung wurde erstellt');
      return res.data;
    } catch (e) {
      this.mainStore.displayError('Beim erstellen der Rechnung ist ein Fehler aufgetreten');
      throw e;
    }
  }

  protected cast(offer: Offer) {
    //this prevents empty fields being sent to the backend as ""
    //optimally, this can be handled in the form so empty strings don't even reach here.
    return {
      ...offer,
      fixed_price: offer.fixed_price || null,
    };
  }
}
