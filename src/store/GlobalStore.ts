// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { observable, action, makeObservable } from 'mobx';

class GlobalStore {
  @observable
  page = '';

  @observable
  pageLoading = false;

  @observable
  path = '';

  constructor() {
    makeObservable(this);
  }

  @action
  changeName = (newName: string): void => {
    this.page = newName;
  };

  @action
  changePath = (newPath: string): void => {
    this.path = newPath;
  };

  @action
  startPageLoading = (): void => {
    this.pageLoading = true;
  };

  @action
  endPageLoading = (): void => {
    this.pageLoading = false;
  };
}

const globalStore = new GlobalStore();
export default globalStore;
