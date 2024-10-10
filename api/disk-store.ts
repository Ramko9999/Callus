import * as FileSystem from "expo-file-system";

export interface Store<T> {
  read(partition: string, fallback: T): Promise<T>;
  write(partition: string, content: T): Promise<void>;
}

export class MemoryStore<T> implements Store<T> {
  store: Map<string, T>;

  constructor() {
    this.store = new Map<string, T>();
  }

  async read(partition: string, fallback: T): Promise<T> {
    return new Promise((resolve) =>
      resolve(this.store.get(partition) || fallback)
    );
  }

  async write(partition: string, content: T): Promise<void> {
    return new Promise((resolve) => {
      this.store.set(partition, content);
      resolve();
    });
  }
}

export class DiskStore<T> implements Store<T> {
  appDirectory: string;
  constructor(subdirectory: string) {
    this.appDirectory = `${FileSystem.documentDirectory}${subdirectory}`;
  }

  private async createDirectoryIfNotExists() {
    try {
      const info = await FileSystem.getInfoAsync(this.appDirectory);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(this.appDirectory);
        return info.uri;
      }
      return this.appDirectory;
    } catch (error) {
      console.log(`[DISK-STORE]: Error when getting directory: ${error}`);
      if (error instanceof Error) {
        // handle race conditions where there are multiple callers
        if (error.message.includes("file with the same name already exists")) {
          return this.appDirectory;
        }
      }
      throw error;
    }
  }

  async read(partition: string, fallback: T): Promise<T> {
    const fileUri = `${await this.createDirectoryIfNotExists()}/${partition}.json`;
    try {
      const info = await FileSystem.getInfoAsync(fileUri);
      if (!info.exists) {
        return fallback;
      }
      return JSON.parse(await FileSystem.readAsStringAsync(fileUri));
    } catch (error) {
      console.error(`[DISK-STORE]: Error when reading ${fileUri}: ${error}`);
      throw error;
    }
  }

  async write(partition: string, content: T): Promise<void> {
    const fileUri = `${await this.createDirectoryIfNotExists()}/${partition}.json`;
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(content));
  }
}
