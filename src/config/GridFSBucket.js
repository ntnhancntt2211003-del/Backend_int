import { GridFSBucket as MongoGridFSBucket } from "mongodb";
import { getDb } from "./connectionDB.js";

const db = getDb();
const bucket = new MongoGridFSBucket(db);
export default bucket;
