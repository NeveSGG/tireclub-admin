// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { observable, action, makeObservable } from 'mobx';

class NotificationStore {
  @observable
  status: 'error' | 'warning' | 'success' | 'info' = 'info';

  @observable
  open = false;

  @observable
  message = '';

  constructor() {
    makeObservable(this);
  }

  @action
  success = (message: string): void => {
    this.message = message;
    this.status = 'success';
    this.open = true;
  };

  @action
  info = (message: string): void => {
    this.message = message;
    this.status = 'info';
    this.open = true;
  };

  @action
  warning = (message: string): void => {
    this.message = message;
    this.status = 'warning';
    this.open = true;
  };

  @action
  error = (message: string): void => {
    this.message = message;
    this.status = 'error';
    this.open = true;
  };

  @action
  close = (): void => {
    this.open = false;
    this.message = '';
    this.status = 'info';
  };
}

const notificationStore = new NotificationStore();
export default notificationStore;
