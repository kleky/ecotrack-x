import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {Observable} from 'rxjs';
import {IDataStoreOptions} from '../data-stores/IDataStoreOptions';
import {IStore} from '../data-stores/IStore';
import {IVersionedData} from '../data-stores/IVersionedData';
import {LogService} from './log.service';

@Injectable({providedIn: 'root'})
export class FileStore<TData extends IVersionedData> implements IStore {

    public Options: IDataStoreOptions<TData>;
    public data: TData;

    constructor(private storage: Storage,
                private platform: Platform,
                private logger: LogService) {
    }

    get(key: string) {
        return this.data[key];
    }

    async set(key: string, val: any) {
        this.logger.log(`Set data ${key}:`, this.data);
        this.data[key] = val;
        await this.storage.ready();
        return this.storage.set(this.Options.type, this.data);
    }

    async loadOptions(opts: IDataStoreOptions<TData>): Promise<boolean> {
        this.Options = opts;
        this.logger.log('[STORAGE] 1. Options loaded for ' + this.Options.type);
        return true;
    }

    loadDataFile(): Observable<TData> {

        return new Observable(observer => {
            this.platform.ready().then(async () => {
                await this.storage.ready();
                this.logger.log('[STORAGE] ready');
                try {
                    const fileContent: string = await this.storage.get(this.Options.type);
                    this.logger.log('[STORAGE] loaded ' + this.Options.type, fileContent);
                    let data: TData = (fileContent
                        ? fileContent
                        : this.Options.defaults) as TData;

                    if (data.Version < this.Options.defaults.Version) {
                        this.logger.log('[STORAGE] Old version [' + data.Version + '] of [' + this.Options.type + ']. ' +
                            'New version is [' + this.Options.defaults.Version + ']');
                        // todo - map across old data as this will wipe everything - https://github.com/loedeman/AutoMapper
                        data = this.Options.defaults;
                    }
                    this.logger.log('[STORAGE] load complete. Data in memory: ', data);
                    this.data = data;
                    observer.next(data);
                } catch (error) {
                    this.logger.log('[STORAGE] Error encountered trying to load file: ', error);
                    observer.error('Error encountered trying to load file');
                }
            });
        });
    }

    async deleteStorage(type: string) {
        await this.storage.remove(type);
        this.logger.log('Removed ' + type);
    }
}
