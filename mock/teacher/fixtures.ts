import * as fs from "fs";
import * as path from "path";

const D = path.join(__dirname, "data");
// Keep this loader compatible with prepare-demo-mock's browser registry transform.
const read = (f: string): any => JSON.parse(fs.readFileSync(path.join(D, f), "utf-8"));

/** Bounded LRU; failed computations are never cached. Reload mock modules after editing fixtures. */
export function memoizeMock<T>(limit = 128) {
  const entries = new Map<string, T>();
  return (key: string, compute: () => T): T => {
    if (entries.has(key)) {
      const value = entries.get(key)!;
      entries.delete(key);
      entries.set(key, value);
      return value;
    }
    const value = compute();
    entries.set(key, value);
    if (entries.size > limit) entries.delete(entries.keys().next().value!);
    return value;
  };
}

const fixtures = memoizeMock<any>(32);
/** Shared read-only fixture objects: consumers must copy before modifying. */
export const readTeacherFixture = (name: string): any => fixtures(name, () => read(name));

const students = memoizeMock<Map<string, any>>(8);
export function findStudent(classId: string, studentId: string) {
  return students(classId, () => new Map(
    readTeacherFixture(`class-students-${classId}.json`).map((s: any) => [s.student_id, s]),
  )).get(studentId);
}
