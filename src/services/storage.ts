import { openDB } from "idb";

interface ProjectSnapshot {
  id: string;
  name: string;
  sourceText: string;
  updatedAt: number;
}

const dbPromise = openDB("syson-front", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("projects")) {
      db.createObjectStore("projects", { keyPath: "id" });
    }
  },
});

export const storage = {
  async saveProject(project: ProjectSnapshot) {
    const db = await dbPromise;
    await db.put("projects", project);
  },
  async loadProject(id: string) {
    const db = await dbPromise;
    return db.get("projects", id) as Promise<ProjectSnapshot | undefined>;
  },
};

