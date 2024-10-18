import * as FileSystem from "expo-file-system";

export interface Store<T> {
  read(partition: string): Promise<T>;
  write(partition: string, content: T): Promise<void>;
  readAllPartitions(): Promise<Map<string, T>>;
}

export class MemoryStore<T> implements Store<T> {
  store: Map<string, T>;
  fallback: T;

  constructor(fallback: T) {
    this.store = new Map<string, T>();
    this.fallback = fallback;
  }

  async read(partition: string): Promise<T> {
    return new Promise((resolve) =>
      resolve(this.store.get(partition) || this.fallback)
    );
  }

  async write(partition: string, content: T): Promise<void> {
    return new Promise((resolve) => {
      this.store.set(partition, content);
      resolve();
    });
  }

  async readAllPartitions() {
    const partitions = this.store.keys().toArray();
    const data = (await Promise.all(
      partitions.map((partition) => this.read(partition))
    )) as T[];
    return new Map(
      partitions.map((partition, index) => [partition, data[index]])
    );
  }
}

export class DiskStore<T> implements Store<T> {
  appDirectory: string;
  fallback: T;

  constructor(subdirectory: string, fallback: T) {
    this.appDirectory = `${FileSystem.documentDirectory}${subdirectory}`;
    this.fallback = fallback;
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

  async read(partition: string): Promise<T> {
    const fileUri = `${await this.createDirectoryIfNotExists()}/${partition}.json`;
    try {
      const info = await FileSystem.getInfoAsync(fileUri);
      if (!info.exists) {
        return this.fallback;
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

  async readAllPartitions() {
    const appDir = await this.createDirectoryIfNotExists();
    const partitions = (await FileSystem.readDirectoryAsync(appDir)).map((p) =>
      p.replace(".json", "")
    ).filter((p) => !p.includes("programs"));

    const data = (await Promise.all(
      partitions.map((partition) => this.read(partition))
    )) as T[];
    return new Map(
      partitions.map((partition, index) => [partition, data[index]])
    );
  }
}
