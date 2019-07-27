import {Injectable} from "@angular/core";
import {Platform} from "@ionic/angular";
import {Storage} from "@ionic/storage";
import {Observable} from "rxjs";
import {IDataStoreOptions} from "../data-stores/IDataStoreOptions";
import {IStore} from "../data-stores/IStore";
import {IVersionedData} from "../data-stores/IVersionedData";
import {LogService} from "./log.service";
import {Logger} from "ionic-logging-service";

@Injectable({providedIn: "root"})
export class FileStore<TData extends IVersionedData> implements IStore {

    public Options: IDataStoreOptions<TData>;
    public data: TData;
    private logger: Logger;

    constructor(private storage: Storage,
                private platform: Platform,
                private logService: LogService) {
        this.logger = this.logService.getLogger(`FileStore`);
    }

    get(key: string) {
        this.logger.debug("get", key, this.data[key]);
        return this.data[key];
    }

    async set(key: string, val: any) {
        this.logger.debug(`set`, `data ${key}:`, this.data);
        this.data[key] = val;
        await this.storage.ready();
        return this.storage.set(this.Options.type, this.data);
    }

    async loadOptions(opts: IDataStoreOptions<TData>): Promise<boolean> {
        this.Options = opts;
        this.logger.debug("loadOptions", "Options loaded for " + this.Options.type);
        return true;
    }

    loadDataFile(): Observable<TData> {

        return new Observable(observer => {
            this.platform.ready().then(async () => {
                this.logger.entry("loadDataFile");
                await this.storage.ready();
                this.logger.debug("loadDataFile", "ready");
                try {
                    const fileContent: string = await this.storage.get(this.Options.type);
                    this.logger.debug("loadDataFile", "storage content loaded for " + this.Options.type, fileContent);
                    let data: TData = (fileContent
                        ? fileContent
                        : this.Options.defaults) as TData;

                    if (data.Version < this.Options.defaults.Version) {
                        this.logger.debug("loadDataFile", "Old version [" + data.Version + "] of [" + this.Options.type + "]. " +
                            "New version is [" + this.Options.defaults.Version + "]");
                        // todo - map across old data as this will wipe everything - https://github.com/loedeman/AutoMapper
                        data = this.Options.defaults;
                    }
                    this.data = data;
                    observer.next(data);
                    this.logger.exit("loadDataFile", data);
                } catch (error) {
                    this.logger.error("loadDataFile", error);
                    observer.error("Error encountered trying to load file");
                }
            });
        });
    }

    async deleteStorage(type: string) {
        await this.storage.remove(type);
        this.logger.debug("deleteStorage", "Removed " + type);
    }
}
